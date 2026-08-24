import { nanoid } from '@reduxjs/toolkit';
import { chatsApi } from '../../api/chatsApi';
import { streamChatMessage } from '../../api/chatStream';
import { getErrorMessage } from '../../api/errors';
import type { ChatMessage } from '../../api/types';
import type { AppDispatch, RootState } from '../../app/store';
import {
  appendDelta,
  applyChatEvent,
  discardFailedMessage,
  finishPalMessage,
  isPendingChatKey,
  pendingChatKey,
  streamAborted,
  streamFailed,
  streamIdle,
  streamStarted,
  upsertMessage,
} from './chatSlice';

let activeAbortController: AbortController | null = null;
let activeStreamId: string | null = null;
let activeStreamChatKey: string | null = null;

export interface SendChatTarget {
  chatId?: string;
  palId?: string;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

export function abortChatMessage() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (!activeAbortController) return;

    const state = getState();
    const chatKey = activeStreamChatKey;
    const streamId = activeStreamId;

    activeAbortController.abort();
    activeAbortController = null;
    activeStreamId = null;
    activeStreamChatKey = null;

    if (streamId && chatKey && state.chat.status === 'streaming') {
      dispatch(streamAborted({ chatKey }));
    }
  };
}

export function resendFailedMessage(messageId: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    if (state.chat.status === 'streaming') return;

    const error = state.chat.error;
    if (!error?.messageId || error.messageId !== messageId) return;

    const chatKey = error.chatKey;
    const message =
      state.chat.messagesByChatId[chatKey]?.find((item) => item.id === messageId) ??
      (state.chat.optimisticUserByChatId[chatKey]?.id === messageId
        ? state.chat.optimisticUserByChatId[chatKey]
        : undefined);
    if (!message?.message.trim()) return;

    const text = message.message;
    dispatch(discardFailedMessage({ chatKey, messageId }));
    void dispatch(
      sendChatMessage(text, {
        chatId: isPendingChatKey(chatKey) ? undefined : chatKey,
        palId: error.palId,
      })
    );
  };
}

export function sendChatMessage(text: string, target: SendChatTarget = {}) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const state = getState();
    if (state.chat.status === 'streaming') return;

    const token = state.auth.token;
    if (!token) {
      dispatch(streamFailed({ text: 'You need to be signed in.' }));
      return;
    }

    const chatId = target.chatId;
    const palId = target.palId;
    if (!chatId && !palId) {
      dispatch(streamFailed({ text: 'Pick a pal or a chat first.' }));
      return;
    }

    const chatKey = chatId ?? pendingChatKey(palId!);
    const optimistic: ChatMessage = {
      id: `temp-${nanoid()}`,
      message: trimmed,
      authorType: 'user',
      authorId: state.auth.user?.id ?? 'me',
      createdAt: new Date().toISOString(),
    };

    const streamId = nanoid();
    const abortController = new AbortController();
    activeAbortController = abortController;
    activeStreamId = streamId;
    activeStreamChatKey = chatKey;

    dispatch(streamStarted({ key: chatKey, optimistic }));

    let resolvedChatId = chatId;
    let userMessageId = optimistic.id;

    try {
      await streamChatMessage({
        message: trimmed,
        chatId,
        palId: chatId ? undefined : palId,
        token,
        signal: abortController.signal,
        handlers: {
          onChat(chat) {
            if (activeStreamId !== streamId) return;
            resolvedChatId = chat.id;
            activeStreamChatKey = chat.id;
            dispatch(applyChatEvent(chat));
            dispatch(
              chatsApi.util.updateQueryData('getChats', undefined, (draft) => {
                if (!draft.items.some((item) => item.id === chat.id)) {
                  draft.items.unshift(chat);
                }
              })
            );
          },
          onUserMessage(message) {
            if (activeStreamId !== streamId) return;
            userMessageId = message.id;
            dispatch(
              upsertMessage({
                chatKey: resolvedChatId ?? chatKey,
                message,
              })
            );
          },
          onDelta(content) {
            if (activeStreamId !== streamId) return;
            dispatch(
              appendDelta({
                chatKey: resolvedChatId ?? chatKey,
                content,
              })
            );
          },
          onDone(palMessage) {
            if (activeStreamId !== streamId) return;
            dispatch(
              finishPalMessage({
                chatKey: resolvedChatId ?? chatKey,
                message: palMessage,
              })
            );
            if (resolvedChatId) {
              dispatch(
                chatsApi.util.updateQueryData('getChats', undefined, (draft) => {
                  const chat = draft.items.find((item) => item.id === resolvedChatId);
                  if (chat) {
                    chat.lastMessage = palMessage.message;
                    chat.updatedAt = palMessage.createdAt;
                  }
                })
              );
            }
          },
        },
      });

      if (activeStreamId !== streamId) return;

      activeAbortController = null;
      activeStreamId = null;
      activeStreamChatKey = null;
      dispatch(streamIdle());
    } catch (error) {
      if (activeStreamId !== streamId) return;

      activeAbortController = null;
      activeStreamId = null;
      activeStreamChatKey = null;

      if (isAbortError(error) || abortController.signal.aborted) {
        dispatch(
          streamAborted({
            chatKey: resolvedChatId ?? chatKey,
          })
        );
        return;
      }

      dispatch(
        streamFailed({
          chatKey: resolvedChatId ?? chatKey,
          messageId: userMessageId,
          palId,
          text: getErrorMessage(error, 'Could not get a reply for that message.'),
        })
      );
    }
  };
}
