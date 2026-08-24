import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetChatsQuery } from '../api/chatsApi';
import { getErrorMessage } from '../api/errors';
import { useGetMyPalsQuery, useGetPalsQuery } from '../api/palsApi';
import type { Pal } from '../api/types';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutUser } from '../features/auth/logoutUser';
import { chatPathForPal } from '../features/chat/useActiveThread';
import { formatMessageTime } from '../utils/datetime';
import Avatar from './Avatar';
import ThreadItem from './ThreadItem';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { palId: activePalId } = useParams<{ palId?: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const messagesByChatId = useAppSelector((state) => state.chat.messagesByChatId);

  const [query, setQuery] = useState('');
  const [isPickingPal, setPickingPal] = useState(false);

  const { data: chatsData, isLoading: chatsLoading, error: chatsError } = useGetChatsQuery();
  const { data: myPals, isLoading: myPalsLoading } = useGetMyPalsQuery(undefined, {
    skip: !isPickingPal,
  });
  const { data: publicPals, isLoading: publicPalsLoading } = useGetPalsQuery(undefined, {
    skip: !isPickingPal,
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const chats = chatsData?.items ?? [];

  const visibleChats = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.trim().toLowerCase();
    return chats.filter((chat) => chat.palName.toLowerCase().includes(q));
  }, [chats, query]);

  const palSections = useMemo(() => {
    const mine = myPals ?? [];
    const pub = publicPals?.items ?? [];
    const mineIds = new Set(mine.map((pal) => pal.id));
    const discover = pub.filter((pal) => !mineIds.has(pal.id));
    const q = query.trim().toLowerCase();
    const matches = (pal: Pal) =>
      !q ||
      pal.name.toLowerCase().includes(q) ||
      pal.description?.toLowerCase().includes(q) ||
      pal.language.toLowerCase().includes(q);

    return {
      mine: mine.filter(matches),
      discover: discover.filter(matches),
    };
  }, [myPals, publicPals, query]);

  function handleThreadOpened() {
    setPickingPal(false);
    onClose?.();
  }

  function handleLogout() {
    dispatch(logoutUser());
    navigate('/', { replace: true });
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-80 max-w-[85%] flex-col
          bg-warm-50 dark:bg-dark-900 border-r border-warm-200 dark:border-dark-700
          shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:static sm:z-auto sm:w-80 lg:w-96 sm:max-w-none sm:translate-x-0 sm:shadow-sm sm:flex-shrink-0`}
      >
        <div className="px-5 py-4 border-b border-warm-200 dark:border-dark-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-warm-800 dark:text-dark-100 tracking-tight">
            <i className="far fa-comments mr-2 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
            {isPickingPal ? 'New chat' : 'Chats'}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPickingPal((open) => !open)}
              className="text-warm-500 hover:text-indigo-600 dark:text-dark-300 dark:hover:text-indigo-400 transition p-2 rounded-full hover:bg-warm-200 dark:hover:bg-dark-700"
              title={isPickingPal ? 'Back to chats' : 'New chat'}
              aria-label={isPickingPal ? 'Back to chats' : 'New chat'}
            >
              <i className={`fas ${isPickingPal ? 'fa-arrow-left' : 'fa-pen-to-square'} text-lg`} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <i
              className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isPickingPal ? 'Search pals...' : 'Search chats...'}
              aria-label={isPickingPal ? 'Search pals' : 'Search chats'}
              className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scroll px-3 pb-3 space-y-1" aria-label={isPickingPal ? 'Pals' : 'Chats'}>
          {isPickingPal ? (
            <>
              {(myPalsLoading || publicPalsLoading) && (
                <p className="px-3 py-4 text-sm text-warm-500 dark:text-dark-400">Loading pals…</p>
              )}
              <PalGroup title="Your pals" pals={palSections.mine} onOpened={handleThreadOpened} />
              <PalGroup title="Discover" pals={palSections.discover} onOpened={handleThreadOpened} />
              {!myPalsLoading &&
                !publicPalsLoading &&
                palSections.mine.length === 0 &&
                palSections.discover.length === 0 && (
                  <p className="px-3 py-4 text-sm text-warm-500 dark:text-dark-400">
                    {query.trim() ? `No pals match “${query}”.` : 'No pals yet.'}
                  </p>
                )}
            </>
          ) : (
            <>
              {chatsLoading && (
                <p className="px-3 py-4 text-sm text-warm-500 dark:text-dark-400">Loading chats…</p>
              )}
              {chatsError && (
                <p className="px-3 py-4 text-sm text-red-500">
                  {getErrorMessage(chatsError, 'Could not load chats.')}
                </p>
              )}
              {!chatsLoading && visibleChats.length === 0 && (
                <p className="px-3 py-4 text-sm text-warm-500 dark:text-dark-400">
                  {query.trim()
                    ? `No chats match “${query}”.`
                    : <>No chats yet. <Link to="/pals" className="text-indigo-400 hover:underline">Start one with a pal</Link>.</>
               
                  }            
                </p>
              )}
              {visibleChats.map((chat) => {
                const localMessages = messagesByChatId[chat.id] ?? [];
                const lastLocal = localMessages[localMessages.length - 1];
                const lastMessage = lastLocal?.message ?? chat.lastMessage ?? 'Start a conversation';
                const time = formatMessageTime(lastLocal?.createdAt ?? chat.updatedAt);
                return (
                  <ThreadItem
                    key={chat.id}
                    thread={{
                      id: chat.id,
                      palId: chat.palId,
                      name: chat.palName,
                      image: chat.palImage,
                      palCountry: chat.palCountry,
                      lastMessage,
                      time,
                      unread: 0,
                    }}
                    isActive={chat.palId === activePalId}
                    onSelect={onClose}
                  />
                );
              })}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-warm-200 dark:border-dark-700 bg-warm-100/80 dark:bg-dark-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Link
              to="/pals"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-warm-600 dark:text-dark-300 hover:bg-warm-200 dark:hover:bg-dark-700 transition"
              title="Manage pals"
            >
              <i className="fas fa-user-group" aria-hidden="true" />
              Pals
            </Link>
            <Link
              to="/settings/profile"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-warm-600 dark:text-dark-300 hover:bg-warm-200 dark:hover:bg-dark-700 transition"
              title="Settings"
            >
              <i className="fas fa-gear" aria-hidden="true" />
              Settings
            </Link>
          </div>
          <div className="flex items-center gap-3">
          <Avatar
            name={user?.name ?? 'You'}
            image={user?.profileImage}
            initials={user?.initials}
            className="w-9 h-9 text-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-800 dark:text-dark-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-warm-500 dark:text-dark-400 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-warm-400 hover:text-red-500 dark:text-dark-400 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-warm-200 dark:hover:bg-dark-700 transition"
            title="Log out"
            aria-label="Log out"
          >
            <i className="fas fa-arrow-right-from-bracket text-sm" aria-hidden="true" />
          </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 dark:bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function PalGroup({
  title,
  pals,
  onOpened,
}: {
  title: string;
  pals: Pal[];
  onOpened?: () => void;
}) {
  if (pals.length === 0) return null;

  return (
    <section className="mb-3">
      <h3 className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-warm-400 dark:text-dark-500">
        {title}
      </h3>
      <div className="space-y-1">
        {pals.map((pal) => (
          <Link
            key={pal.id}
            to={chatPathForPal(pal.id)}
            onClick={onOpened}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left no-underline hover:bg-warm-100 dark:hover:bg-dark-800 transition"
          >
            <Avatar name={pal.name} image={pal.image} className="w-10 h-10 text-sm flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-warm-800 dark:text-dark-100 truncate">{pal.name}</p>
              <p className="text-xs text-warm-500 dark:text-dark-400 truncate">
                {pal.language} · {pal.languageLevel} · {pal.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
