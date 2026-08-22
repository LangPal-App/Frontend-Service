import { API_BASE_URL } from './config';
import { toApiError } from './errors';
import { parseSseStream } from './sse';
import type { ChatMessage, ChatSummary } from './types';

export interface ChatStreamHandlers {
  onChat: (chat: ChatSummary) => void;
  onUserMessage: (message: ChatMessage) => void;
  onDelta: (content: string) => void;
  onDone: (palMessage: ChatMessage) => void;
}

export async function streamChatMessage(options: {
  message: string;
  chatId?: string;
  palId?: string;
  token: string;
  signal?: AbortSignal;
  handlers: ChatStreamHandlers;
}): Promise<void> {
  const path = options.chatId
    ? `/chat-service/chats/${encodeURIComponent(options.chatId)}/messages`
    : `/chat-service/chats/pals/${encodeURIComponent(options.palId ?? '')}/messages`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ message: options.message }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  await parseSseStream(response, (event, data) => {
    switch (event) {
      case 'chat':
        options.handlers.onChat(JSON.parse(data) as ChatSummary);
        break;
      case 'user_message':
        options.handlers.onUserMessage(JSON.parse(data) as ChatMessage);
        break;
      case 'delta': {
        const payload = JSON.parse(data) as { content?: string };
        options.handlers.onDelta(payload.content ?? '');
        break;
      }
      case 'done': {
        const payload = JSON.parse(data) as { palMessage: ChatMessage };
        options.handlers.onDone(payload.palMessage);
        break;
      }
      case 'error': {
        const payload = JSON.parse(data) as { message?: string };
        throw new Error(
          payload.message?.trim() || 'Pal did not respond. Please try again.'
        );
      }
      default:
        break;
    }
  });
}
