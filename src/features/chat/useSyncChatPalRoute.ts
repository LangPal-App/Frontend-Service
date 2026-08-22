import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetChatsQuery } from '../../api/chatsApi';
import { useGetMyPalsQuery, useGetPalsQuery } from '../../api/palsApi';
import { useAppDispatch } from '../../app/hooks';
import { setActiveChat, startChatWithPal } from './chatSlice';

export function chatPathForPal(palId: string) {
  return `/chat/${palId}`;
}

export function useSyncChatPalRoute() {
  const { palId } = useParams<{ palId?: string }>();
  const dispatch = useAppDispatch();

  const { data: chatsData } = useGetChatsQuery();
  const { data: myPals, isLoading: myPalsLoading } = useGetMyPalsQuery(undefined, {
    skip: !palId,
  });
  const { data: publicPals, isLoading: publicPalsLoading } = useGetPalsQuery(undefined, {
    skip: !palId,
  });

  useEffect(() => {
    if (!palId) return;

    const existingChat = chatsData?.items?.find((chat) => chat.palId === palId);
    if (existingChat) {
      dispatch(setActiveChat(existingChat.id));
      return;
    }

    if (myPalsLoading || publicPalsLoading) return;

    const pal =
      myPals?.find((item) => item.id === palId) ??
      publicPals?.items?.find((item) => item.id === palId);

    if (pal) {
      dispatch(startChatWithPal(pal));
    }
  }, [
    palId,
    chatsData,
    myPals,
    publicPals,
    myPalsLoading,
    publicPalsLoading,
    dispatch,
  ]);

  return palId;
}
