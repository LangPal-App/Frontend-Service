import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
} from '../api/chatsApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  pendingChatKey,
  prependOlderChatMessages,
  setChatMessagesPage,
} from '../features/chat/chatSlice';
import { resendFailedMessage } from '../features/chat/sendChatMessage';
import { useActiveThread } from '../features/chat/useActiveThread';
import type { UiMessage } from '../types/chat';
import { formatMessageTime } from '../utils/datetime';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { palId, chat, pal, chatId, isLoading: threadLoading } = useActiveThread();
  const messagesByChatId = useAppSelector((state) => state.chat.messagesByChatId);
  const messagesPaginationByChatId = useAppSelector(
    (state) => state.chat.messagesPaginationByChatId
  );
  const streamingByChatId = useAppSelector((state) => state.chat.streamingByChatId);
  const optimisticUserByChatId = useAppSelector((state) => state.chat.optimisticUserByChatId);
  const status = useAppSelector((state) => state.chat.status);
  const error = useAppSelector((state) => state.chat.error);

  const {
    currentData: initialMessages,
    isFetching: isFetchingInitialMessages,
    isError: initialMessagesError,
  } = useGetChatMessagesQuery(
    { chatId: chatId ?? '', page: 1 },
    { skip: !chatId }
  );

  const [fetchOlderMessages, { isFetching: isFetchingOlderMessages }] =
    useLazyGetChatMessagesQuery();

  useEffect(() => {
    if (!chatId || !initialMessages) return;
    dispatch(
      setChatMessagesPage({
        chatId,
        messages: initialMessages.messages,
        pagination: {
          page: initialMessages.meta.page,
          totalPages: initialMessages.meta.totalPages,
        },
      })
    );
  }, [chatId, dispatch, initialMessages]);

  const palName = chat?.palName ?? pal?.name;
  const palImage = chat?.palImage ?? pal?.image ?? null;
  const palLanguage = pal
    ? `${pal.language} · ${pal.languageLevel}`
    : chat
      ? 'Language partner'
      : null;

  const chatKey = chatId ?? (palId ? pendingChatKey(palId) : null);

  const messages = useMemo((): UiMessage[] => {
    if (!chatKey) return [];
    const sendError =
      error?.chatKey === chatKey && error.messageId ? error : null;
    const canResend = Boolean(sendError) && status !== 'streaming';
    const stored = messagesByChatId[chatKey] ?? [];
    const ui: UiMessage[] = stored.map((message) => {
      const isOwn = message.authorType === 'user';
      const isFailedSend = sendError?.messageId === message.id;
      return {
        id: message.id,
        sender: isOwn ? 'You' : palName ?? 'Pal',
        text: message.message,
        time: formatMessageTime(message.createdAt),
        isOwn,
        error: isFailedSend ? sendError.text : undefined,
        canResend: isFailedSend ? canResend : undefined,
        imageUrl: isOwn ? user?.profileImage : palImage,
        avatar: isOwn ? user?.initials ?? 'Y' : palName?.charAt(0).toUpperCase() ?? 'P',
      };
    });

    const optimistic = optimisticUserByChatId[chatKey];
    if (optimistic && !stored.some((message) => message.id === optimistic.id)) {
      const isFailedSend = sendError?.messageId === optimistic.id;
      ui.push({
        id: optimistic.id,
        sender: 'You',
        text: optimistic.message,
        time: formatMessageTime(optimistic.createdAt),
        isOwn: true,
        error: isFailedSend ? sendError.text : undefined,
        canResend: isFailedSend ? canResend : undefined,
        imageUrl: user?.profileImage,
        avatar: user?.initials ?? 'Y',
      });
    }

    const streaming = streamingByChatId[chatKey];
    if (streaming != null) {
      ui.push({
        id: `${chatKey}-streaming`,
        sender: palName ?? 'Pal',
        text: streaming,
        time: '',
        isOwn: false,
        isStreaming: true,
        imageUrl: palImage,
        avatar: palName?.charAt(0).toUpperCase() ?? 'P',
      });
    }

    return ui;
  }, [
    chatKey,
    error,
    messagesByChatId,
    optimisticUserByChatId,
    palImage,
    palName,
    status,
    streamingByChatId,
    user?.initials,
    user?.profileImage,
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const pendingScrollRestoreRef = useRef<{ height: number; top: number } | null>(null);

  const pagination = chatId ? messagesPaginationByChatId[chatId] : undefined;
  const hasOlderMessages =
    Boolean(pagination) && pagination!.page < pagination!.totalPages;
  const historyLoaded = Boolean(pagination);
  const showNoMoreMessages =
    Boolean(chatId) && historyLoaded && !hasOlderMessages && messages.length > 0;

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 80;
  }, []);

  const handleLoadOlderMessages = useCallback(async () => {
    if (!chatId || !pagination || !hasOlderMessages || isFetchingOlderMessages) {
      return;
    }

    const node = scrollRef.current;
    if (node) {
      pendingScrollRestoreRef.current = {
        height: node.scrollHeight,
        top: node.scrollTop,
      };
    }

    const nextPage = pagination.page + 1;
    const result = await fetchOlderMessages({ chatId, page: nextPage });
    if (result.data) {
      dispatch(
        prependOlderChatMessages({
          chatId,
          messages: result.data.messages,
          pagination: {
            page: result.data.meta.page,
            totalPages: result.data.meta.totalPages,
          },
        })
      );
    }
  }, [
    chatId,
    dispatch,
    fetchOlderMessages,
    hasOlderMessages,
    isFetchingOlderMessages,
    pagination,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      shouldStickToBottomRef.current = true;
    }
  }, [chatKey]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    if (pendingScrollRestoreRef.current) {
      const { height, top } = pendingScrollRestoreRef.current;
      pendingScrollRestoreRef.current = null;
      node.scrollTop = node.scrollHeight - height + top;
      return;
    }

    if (shouldStickToBottomRef.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  if (!palId) {
    return (
      <main className="flex-1 flex items-center justify-center text-warm-500 dark:text-dark-400 bg-warm-50 dark:bg-dark-950 px-6 text-center">
        <p>Pick a pal from the sidebar to start a conversation.</p>
      </main>
    );
  }

  if (!palName) {
    return (
      <main className="flex-1 flex items-center justify-center text-warm-500 dark:text-dark-400 bg-warm-50 dark:bg-dark-950 px-6 text-center">
        <p>{threadLoading ? 'Loading chat…' : 'This pal could not be found.'}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-warm-50 dark:bg-dark-950 relative">
      <div className="px-5 py-3 sm:py-4 border-b border-warm-200 dark:border-dark-700 flex items-center gap-3 bg-warm-50/90 dark:bg-dark-950/90 backdrop-blur-sm sticky top-0 z-10">
        <Avatar name={palName} image={palImage} className="w-10 h-10 text-sm shadow-sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-warm-800 dark:text-dark-100 truncate text-base sm:text-lg">
            {palName}
          </h3>
          <p className="text-xs text-warm-500 dark:text-dark-400 flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                status === 'streaming' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
              }`}
              aria-hidden="true"
            />
            <span>{status === 'streaming' ? 'Replying…' : palLanguage}</span>
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 py-5 space-y-5 bg-warm-100/50 dark:bg-dark-900/50"
      >
        {chatId && (
          <div className="flex justify-center pb-1">
            {hasOlderMessages ? (
              <button
                type="button"
                onClick={handleLoadOlderMessages}
                disabled={isFetchingOlderMessages}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-60 transition"
              >
                {isFetchingOlderMessages ? 'Loading older messages…' : 'Load older messages'}
              </button>
            ) : showNoMoreMessages ? (
              <span className="text-xs text-warm-400 dark:text-dark-500">
                No more messages
              </span>
            ) : isFetchingInitialMessages ? (
              <span className="text-xs text-warm-400 dark:text-dark-500">
                Loading messages…
              </span>
            ) : null}
          </div>
        )}
        {messages.length === 0 && !isFetchingInitialMessages && (
          <p className="text-center text-sm text-warm-500 dark:text-dark-400 pt-8">
            Say hello in the language you want to practice.
          </p>
        )}
        {initialMessagesError && messages.length === 0 && (
          <p className="text-center text-xs text-red-500 px-4">
            Could not load messages for this chat.
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onResend={
              message.canResend
                ? () => {
                    dispatch(resendFailedMessage(message.id));
                  }
                : undefined
            }
          />
        ))}
        {error && !error.messageId && (
          <p className="text-center text-xs text-red-500 px-4" role="alert">
            {error.text}
          </p>
        )}
      </div>

      <MessageInput chatId={chatId} palId={palId} />
    </main>
  );
}
