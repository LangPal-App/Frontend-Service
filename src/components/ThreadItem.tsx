import type { Thread } from '../types/chat';
import Avatar from './Avatar';
import { countryCodeToFlag } from '../utils/localisation';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onSelect: () => void;
}

export default function ThreadItem({ thread, isActive, onSelect }: ThreadItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-current={isActive}
      className={`thread-item group flex items-center gap-3 px-3 py-3 rounded-r-xl cursor-pointer border-l-4 ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 shadow-sm'
          : 'border-transparent hover:bg-warm-100 dark:hover:bg-dark-800'
      }`}
    >
      <Avatar name={thread.name} image={thread.image} className="w-10 h-10 text-sm flex-shrink-0 shadow-sm" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-sm text-warm-800 dark:text-dark-100 truncate flex items-center gap-1">
            {thread.name.length > 15 ? thread.name.slice(0, 15) + '...' : thread.name}
       
            {thread.palCountry && (
              <span title={thread.palCountry} className="ml-1 text-base align-middle">
                {countryCodeToFlag(thread.palCountry)}
              </span>
            )}
          </span>
          <span className="text-[10px] text-warm-500 dark:text-dark-400 whitespace-nowrap ml-1">
            {thread.time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-warm-500 dark:text-dark-400 truncate pr-2">
            {thread.lastMessage}
          </span>
          {thread.unread > 0 && (
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
