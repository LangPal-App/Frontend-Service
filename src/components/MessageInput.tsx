import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { abortChatMessage, sendChatMessage } from '../features/chat/sendChatMessage';

interface MessageInputProps {
  disabled?: boolean;
}

export default function MessageInput({ disabled = false }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const canSend = useAppSelector(
    (state) => Boolean(state.chat.activeChatId || state.chat.pendingPal)
  );
  const isStreaming = useAppSelector((state) => state.chat.status === 'streaming');
  const [text, setText] = useState('');

  const isDisabled = disabled || !canSend || isStreaming;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isStreaming) return;
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;
    void dispatch(sendChatMessage(trimmed));
    setText('');
  }

  function handleAbort() {
    dispatch(abortChatMessage());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 sm:px-5 py-3 bg-warm-50 dark:bg-dark-950 border-t border-warm-200 dark:border-dark-700 flex items-center gap-2 sm:gap-3"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isStreaming ? 'Waiting for a reply…' : 'Type your message...'}
          aria-label="Write a message"
          disabled={isDisabled}
          className="w-full pl-4 pr-12 py-2.5 bg-warm-100 dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-3xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition disabled:opacity-60"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleAbort}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-warm-600 dark:text-dark-200 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-warm-200/80 dark:hover:bg-dark-700 transition"
            title="Stop generating"
            aria-label="Stop generating reply"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warm-700 dark:bg-dark-100 text-warm-50 dark:text-dark-900">
              <span className="block h-2 w-2 rounded-[1px] bg-current" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim() || isDisabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-full"
            title="Send"
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane text-base" aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="button"
        className="hidden sm:block text-warm-400 hover:text-indigo-500 dark:text-dark-400 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-warm-200 dark:hover:bg-dark-700 transition"
        title="Emoji"
        aria-label="Insert emoji"
      >
        <i className="far fa-face-smile text-lg" aria-hidden="true" />
      </button>
    </form>
  );
}
