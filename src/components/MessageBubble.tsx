import type { Message } from '../types/chat';
import Avatar from './Avatar';

interface MessageBubbleProps {
  message: Message;
  onResend?: () => void;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-label="Pal is typing">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current opacity-60 [animation-delay:150ms]" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current opacity-60 [animation-delay:300ms]" />
    </span>
  );
}

export default function MessageBubble({ message, onResend }: MessageBubbleProps) {
  const isYou = message.isOwn;
  const showTyping = Boolean(message.isStreaming && !message.text);

  return (
    <div className={`message-bubble flex flex-col gap-1.5 ${isYou ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-2 w-full ${isYou ? 'justify-end' : 'justify-start'}`}>
        <div className={`${isYou ? 'order-2' : 'order-1'} flex-shrink-0`}>
          <Avatar
            name={message.sender}
            image={message.imageUrl}
            initials={message.avatar}
            className="w-7 h-7 text-[10px]"
          />
        </div>
        <div
          className={`${isYou ? 'order-1' : 'order-2'} max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl break-words ${
            isYou
              ? 'bg-indigo-500 dark:bg-indigo-600 text-white rounded-br-md'
              : 'bg-warm-50 dark:bg-dark-800 border border-warm-200 dark:border-dark-700 text-warm-800 dark:text-dark-100 rounded-bl-md shadow-sm'
          }`}
        >
          {showTyping ? (
            <TypingDots />
          ) : (
            <p className="text-sm leading-relaxed">
              {message.text}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-current animate-pulse" />
              )}
            </p>
          )}
          {message.time && (
            <span className="text-[10px] opacity-70 mt-1 block text-right">{message.time}</span>
          )}
        </div>
      </div>
      {message.error && (
        <div
          className={`max-w-[75%] sm:max-w-[65%] flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 ${
            isYou ? 'justify-end mr-9' : 'justify-start ml-9'
          }`}
        >
          <p role="alert">{message.error}</p>
          /*
          {message.canResend && onResend && (
            <button
              type="button"
              onClick={onResend}
              className="shrink-0 rounded-full px-1.5 py-0.5 text-sm leading-none text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition"
              title="Resend message"
              aria-label="Resend message"
            >
              ↻
            </button>
          )}
          */
        </div>
      )}
    </div>
  );
}
