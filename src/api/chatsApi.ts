import { langpalApi } from './emptyApi';
import type {
  ApiEnvelope,
  ChatMessage,
  ChatMessagesData,
  ChatSummary,
  Paginated,
  PaginationMeta,
} from './types';
import { unwrapList } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeMessage(raw: unknown): ChatMessage | null {
  if (!isRecord(raw)) return null;
  const id = raw.id ?? raw._id;
  if (id == null) return null;
  const authorType = raw.authorType === 'user' || raw.authorType === 'pal' ? raw.authorType : null;
  if (!authorType) return null;

  return {
    id: String(id),
    message: String(raw.message ?? ''),
    authorType,
    authorId: String(raw.authorId ?? ''),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

function normalizeChat(raw: unknown): ChatSummary | null {
  if (!isRecord(raw)) return null;
  const id = raw.id ?? raw._id;
  if (id == null) return null;

  const palImage =
    typeof raw.palImage === 'string'
      ? raw.palImage
      : typeof raw.image === 'string'
        ? raw.image
        : null;

  return {
    id: String(id),
    palId: String(raw.palId ?? ''),
    palName: String(raw.palName ?? raw.name ?? 'Pal'),
    palImage,
    palCountry: String(raw.palCountry ?? ''),
    lastMessage: typeof raw.lastMessage === 'string' ? raw.lastMessage : null,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

export interface ChatMessagesPage {
  messages: ChatMessage[];
  meta: PaginationMeta;
}

function normalizeChatMessagesResponse(
  response: ApiEnvelope<ChatMessagesData | null> | ChatMessagesData | null
): ChatMessagesPage {
  if (!response) return { messages: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  const payload = isRecord(response) && 'data' in response ? response.data : response;
  const meta =
    isRecord(response) && 'meta' in response && isRecord(response.meta)
      ? {
          page: Number(response.meta.page ?? 1),
          limit: Number(response.meta.limit ?? 20),
          total: Number(response.meta.total ?? 0),
          totalPages: Number(response.meta.totalPages ?? 0),
        }
      : { page: 1, limit: 20, total: 0, totalPages: 0 };

  const rawMessages =
    isRecord(payload) && Array.isArray(payload.messages) ? payload.messages : [];

  return {
    messages: rawMessages
      .map(normalizeMessage)
      .filter((message): message is ChatMessage => message !== null),
    meta,
  };
}

export const chatsApi = langpalApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Paginated<ChatSummary[]>, void>({
      query: () => '/chat-service/chats',
      transformResponse: (response: ApiEnvelope<ChatSummary[] | null> | ChatSummary[] | null) => {
        if (!response) return { items: [] };
        if (Array.isArray(response)) {
          return { items: response.map(normalizeChat).filter((chat): chat is ChatSummary => chat !== null) };
        }
        return {
          items: unwrapList(response.data)
            .map(normalizeChat)
            .filter((chat): chat is ChatSummary => chat !== null),
          meta: response.meta,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((chat) => ({ type: 'Chats' as const, id: chat.id })),
              { type: 'Chats', id: 'LIST' },
            ]
          : [{ type: 'Chats', id: 'LIST' }],
    }),
    getChatMessages: builder.query<
      ChatMessagesPage,
      { chatId: string; page?: number }
    >({
      query: ({ chatId, page = 1 }) => ({
        url: `/chat-service/chats/${chatId}/messages`,
        params: { page },
      }),
      transformResponse: (
        response: ApiEnvelope<ChatMessagesData | null> | ChatMessagesData | null
      ) => normalizeChatMessagesResponse(response),
      providesTags: (_result, _error, { chatId }) => [
        { type: 'Chats', id: chatId },
      ],
    }),
  }),
});



export const { useGetChatsQuery, useGetChatMessagesQuery, useLazyGetChatMessagesQuery } =
  chatsApi;
