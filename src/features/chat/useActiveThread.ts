import { useParams } from 'react-router-dom';
import { useGetChatsQuery } from '../../api/chatsApi';
import { useGetMyPalsQuery, useGetPalsQuery } from '../../api/palsApi';

export function chatPathForPal(palId: string) {
  return `/chat/${palId}`;
}

/** Resolve the open thread from `/chat/:palId` — no Redux sync. */
export function useActiveThread() {
  const { palId } = useParams<{ palId?: string }>();
  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery();
  const chat = palId
    ? chatsData?.items?.find((item) => item.palId === palId)
    : undefined;

  const needsPal = Boolean(palId) && !chatsLoading && !chat;
  const { data: myPals, isLoading: myPalsLoading } = useGetMyPalsQuery(undefined, {
    skip: !needsPal,
  });
  const { data: publicPals, isLoading: publicPalsLoading } = useGetPalsQuery(
    undefined,
    { skip: !needsPal }
  );

  const pal = needsPal
    ? (myPals?.find((item) => item.id === palId) ??
      publicPals?.items?.find((item) => item.id === palId))
    : undefined;

  const isLoading =
    Boolean(palId) &&
    (chatsLoading || (needsPal && (myPalsLoading || publicPalsLoading)));

  return {
    palId,
    chat,
    pal,
    chatId: chat?.id ?? null,
    isLoading,
  };
}
