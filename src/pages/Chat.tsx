import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useSyncChatPalRoute } from '../features/chat/useSyncChatPalRoute';

export default function Chat() {
  useSyncChatPalRoute();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between bg-warm-100 dark:bg-dark-800 border-b border-warm-200 dark:border-dark-700 px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-warm-700 dark:text-dark-200 p-1"
          aria-label="Open threads"
        >
          <i className="fas fa-bars text-xl" aria-hidden="true" />
        </button>
        <h1 className="font-semibold text-lg text-warm-800 dark:text-dark-100">Messages</h1>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatWindow />
      </div>
    </div>
  );
}
