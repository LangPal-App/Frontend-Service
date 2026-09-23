import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const { t } = useTranslation('chat');
  const { palId } = useParams<{ palId?: string }>();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="sm:hidden flex items-center justify-between bg-warm-100 dark:bg-dark-800 border-b border-warm-200 dark:border-dark-700 px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-warm-700 dark:text-dark-200 p-1"
          aria-label={t('openThreads')}
        >
          <i className="fas fa-bars text-xl" aria-hidden="true" />
        </button>
        <h1 className="font-semibold text-lg text-warm-800 dark:text-dark-100">{t('messages')}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatWindow key={palId ?? 'none'} />
      </div>
    </div>
  );
}
