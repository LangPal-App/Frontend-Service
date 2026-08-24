import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ChatMessage,
  ChatSummary,
  MessagesPagination,
} from '../../api/types';
import type { ChatState } from '../../types/chat';
import { logout } from '../auth/authSlice';

const PENDING_CHAT_ID = '__pending__';

const initialState: ChatState = {
  activeChatId: null,
  pendingPal: null,
  messagesByChatId: {},
  messagesPaginationByChatId: {},
  streamingByChatId: {},
  optimisticUserByChatId: {},
  status: 'idle',
  error: null,
};

function upsertById(list: ChatMessage[], message: ChatMessage): ChatMessage[] {
  const index = list.findIndex((item) => item.id === message.id);
  if (index === -1) return [...list, message];
  const next = [...list];
  next[index] = message;
  return next;
}

function mergeMessagesChronologically(
  ...groups: ChatMessage[][]
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const group of groups) {
    for (const message of group) {
      byId.set(message.id, message);
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatError(state) {
      state.error = null;
    },
    streamStarted(
      state,
      action: PayloadAction<{ key: string; optimistic: ChatMessage }>
    ) {
      state.status = 'streaming';
      state.error = null;
      state.optimisticUserByChatId[action.payload.key] = action.payload.optimistic;
      state.streamingByChatId[action.payload.key] = '';
    },
    applyChatEvent(state, action: PayloadAction<ChatSummary>) {
      const pendingKey = pendingChatKey(action.payload.palId);
      const pending =
        state.messagesByChatId[pendingKey] ?? state.messagesByChatId[PENDING_CHAT_ID];
      const pendingStream =
        state.streamingByChatId[pendingKey] ?? state.streamingByChatId[PENDING_CHAT_ID];
      const pendingOptimistic =
        state.optimisticUserByChatId[pendingKey] ??
        state.optimisticUserByChatId[PENDING_CHAT_ID];

      if (pending?.length) {
        state.messagesByChatId[action.payload.id] = [
          ...(state.messagesByChatId[action.payload.id] ?? []),
          ...pending,
        ];
        delete state.messagesByChatId[pendingKey];
        delete state.messagesByChatId[PENDING_CHAT_ID];
      }
      if (pendingStream != null) {
        state.streamingByChatId[action.payload.id] = pendingStream;
        delete state.streamingByChatId[pendingKey];
        delete state.streamingByChatId[PENDING_CHAT_ID];
      }
      if (pendingOptimistic) {
        state.optimisticUserByChatId[action.payload.id] = pendingOptimistic;
        delete state.optimisticUserByChatId[pendingKey];
        delete state.optimisticUserByChatId[PENDING_CHAT_ID];
      }

      state.activeChatId = action.payload.id;
      state.pendingPal = null;
    },
    upsertMessage(
      state,
      action: PayloadAction<{ chatKey: string; message: ChatMessage }>
    ) {
      const { chatKey, message } = action.payload;
      const current = state.messagesByChatId[chatKey] ?? [];
      state.messagesByChatId[chatKey] = upsertById(current, message);
      delete state.optimisticUserByChatId[chatKey];
    },
    appendDelta(state, action: PayloadAction<{ chatKey: string; content: string }>) {
      const { chatKey, content } = action.payload;
      state.streamingByChatId[chatKey] = `${state.streamingByChatId[chatKey] ?? ''}${content}`;
    },
    finishPalMessage(
      state,
      action: PayloadAction<{ chatKey: string; message: ChatMessage }>
    ) {
      const { chatKey, message } = action.payload;
      const current = state.messagesByChatId[chatKey] ?? [];
      state.messagesByChatId[chatKey] = upsertById(current, message);
      delete state.streamingByChatId[chatKey];
      state.status = 'idle';
    },
    streamFailed(
      state,
      action: PayloadAction<{
        text: string;
        chatKey?: string;
        messageId?: string;
        palId?: string;
      }>
    ) {
      const { text, chatKey, messageId, palId } = action.payload;
      state.status = 'failed';
      state.streamingByChatId = {};

      if (chatKey && messageId) {
        const optimistic = state.optimisticUserByChatId[chatKey];
        if (optimistic?.id === messageId) {
          const current = state.messagesByChatId[chatKey] ?? [];
          if (!current.some((message) => message.id === messageId)) {
            state.messagesByChatId[chatKey] = [...current, optimistic];
          }
          delete state.optimisticUserByChatId[chatKey];
        }
        state.error = { chatKey, messageId, text, palId };
        return;
      }

      // Precondition failures (no message sent yet) — show as a thread banner.
      state.error = { chatKey: chatKey ?? '', messageId: '', text };
    },
    discardFailedMessage(
      state,
      action: PayloadAction<{ chatKey: string; messageId: string }>
    ) {
      const { chatKey, messageId } = action.payload;
      const current = state.messagesByChatId[chatKey];
      if (current) {
        state.messagesByChatId[chatKey] = current.filter(
          (message) => message.id !== messageId
        );
      }
      if (state.optimisticUserByChatId[chatKey]?.id === messageId) {
        delete state.optimisticUserByChatId[chatKey];
      }
      if (state.error?.messageId === messageId) {
        state.error = null;
      }
      if (state.status === 'failed') {
        state.status = 'idle';
      }
    },
    streamAborted(state, action: PayloadAction<{ chatKey: string }>) {
      const { chatKey } = action.payload;
      delete state.streamingByChatId[chatKey];
      // Keep the user's optimistic message if the server never confirmed it.
      state.status = 'idle';
      state.error = null;
    },
    streamIdle(state) {
      state.status = 'idle';
    },
    setChatMessagesPage(
      state,
      action: PayloadAction<{
        chatId: string;
        messages: ChatMessage[];
        pagination: MessagesPagination;
      }>
    ) {
      const { chatId, messages, pagination } = action.payload;
      const existing = state.messagesByChatId[chatId] ?? [];
      const chronological = [...messages].reverse();
      state.messagesByChatId[chatId] = mergeMessagesChronologically(
        chronological,
        existing
      );
      state.messagesPaginationByChatId[chatId] = pagination;
    },
    prependOlderChatMessages(
      state,
      action: PayloadAction<{
        chatId: string;
        messages: ChatMessage[];
        pagination: MessagesPagination;
      }>
    ) {
      const { chatId, messages, pagination } = action.payload;
      const existing = state.messagesByChatId[chatId] ?? [];
      const chronological = [...messages].reverse();
      state.messagesByChatId[chatId] = mergeMessagesChronologically(
        chronological,
        existing
      );
      state.messagesPaginationByChatId[chatId] = pagination;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  clearChatError,
  streamStarted,
  applyChatEvent,
  upsertMessage,
  appendDelta,
  finishPalMessage,
  streamFailed,
  discardFailedMessage,
  streamAborted,
  streamIdle,
  setChatMessagesPage,
  prependOlderChatMessages,
} = chatSlice.actions;

export { PENDING_CHAT_ID };

export function pendingChatKey(palId: string) {
  return `${PENDING_CHAT_ID}:${palId}`;
}

export function isPendingChatKey(chatKey: string) {
  return chatKey === PENDING_CHAT_ID || chatKey.startsWith(`${PENDING_CHAT_ID}:`);
}
export default chatSlice.reducer;
