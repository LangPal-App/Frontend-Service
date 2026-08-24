import type { ChatMessage, MessagesPagination, Pal } from '../api/types';

export interface ChatSendError {
  chatKey: string;
  messageId: string;
  text: string;
  palId?: string;
}

export interface ChatState {
  activeChatId: string | null;
  pendingPal: Pal | null;
  messagesByChatId: Record<string, ChatMessage[]>;
  messagesPaginationByChatId: Record<string, MessagesPagination>;
  streamingByChatId: Record<string, string>;
  optimisticUserByChatId: Record<string, ChatMessage>;
  status: 'idle' | 'streaming' | 'failed';
  error: ChatSendError | null;
}

export interface UiMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  isStreaming?: boolean;
  error?: string;
  canResend?: boolean;
  imageUrl?: string | null;
  avatar: string;
}

export type Message = UiMessage;

export interface Thread {
  id: string;
  palId: string;
  name: string;
  image: string | null;
  palCountry: string;
  lastMessage: string;
  time: string;
  unread: number;
}
