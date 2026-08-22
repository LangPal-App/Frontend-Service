import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useDeletePalMutation,
  useGetMyPalsQuery,
  useGetPalsQuery,
} from '../api/palsApi';
import { getErrorMessage } from '../api/errors';
import Avatar from '../components/Avatar';
import PageHeader from '../components/PageHeader';
import { chatPathForPal } from '../features/chat/useSyncChatPalRoute';
import { useAppSelector } from '../app/hooks';

type Tab = 'mine' | 'discover';

export default function PalsList() {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [activeTab, setActiveTab] = useState<Tab>('mine');

  const {
    data: myPals,
    isLoading: myLoading,
    error: myError,
  } = useGetMyPalsQuery();
  const {
    data: publicPals,
    isLoading: publicLoading,
    error: publicError,
  } = useGetPalsQuery({ limit: 50 });

  const [deletePal, { isLoading: isDeleting }] = useDeletePalMutation();

  const discoverPals = (publicPals?.items ?? []).filter(
    (pal) => pal.createdById !== userId && !myPals?.some((mine) => mine.id === pal.id),
  );

  const pals = activeTab === 'mine' ? (myPals ?? []) : discoverPals;
  const isLoading = activeTab === 'mine' ? myLoading : publicLoading;
  const error = activeTab === 'mine' ? myError : publicError;

  async function handleDelete(palId: string, palName: string) {
    if (!window.confirm(`Delete "${palName}"? This cannot be undone.`)) return;
    try {
      await deletePal(palId).unwrap();
    } catch {
      // RTK Query surfaces errors via hook state if needed
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <PageHeader backTo="/chat" backLabel="Chat" title="Pals" />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-warm-800 dark:text-dark-100">Your language pals</h2>
            <p className="mt-1 text-sm text-warm-500 dark:text-dark-400">
              Create and manage AI conversation partners.
            </p>
          </div>
          <Link
            to="/pals/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm transition shrink-0"
          >
            <i className="fas fa-plus" aria-hidden="true" />
            Create pal
          </Link>
        </div>

        <div
          className="flex gap-2 mb-6 p-1 bg-warm-100 dark:bg-dark-800 rounded-xl border border-warm-200 dark:border-dark-700"
          role="tablist"
        >
          {(['mine', 'discover'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-white dark:bg-dark-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-warm-600 dark:text-dark-300 hover:text-warm-800 dark:hover:text-dark-100'
              }`}
            >
              {tab === 'mine' ? 'My pals' : 'Discover'}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-sm text-warm-500 dark:text-dark-400 py-8 text-center">Loading pals…</p>
        )}

        {error != null && (
          <p className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
            {getErrorMessage(error, 'Could not load pals.')}
          </p>
        )}

        {!isLoading && !error && pals.length === 0 && (
          <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-warm-300 dark:border-dark-600">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl">
              <i className="fas fa-user-group" aria-hidden="true" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-dark-100 mb-1">
              {activeTab === 'mine' ? 'No pals yet' : 'Nothing to discover'}
            </p>
            <p className="text-sm text-warm-500 dark:text-dark-400 mb-5">
              {activeTab === 'mine'
                ? 'Create your first language pal to start practicing.'
                : 'Check back later for public pals from the community.'}
            </p>
            {activeTab === 'mine' && (
              <Link
                to="/pals/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition"
              >
                <i className="fas fa-plus" aria-hidden="true" />
                Create your first pal
              </Link>
            )}
          </div>
        )}

        {!isLoading && pals.length > 0 && (
          <ul className="space-y-3">
            {pals.map((pal) => {
              const isOwner = pal.createdById === userId;
              return (
                <li
                  key={pal.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 shadow-sm"
                >
                  <Avatar name={pal.name} image={pal.image} className="w-12 h-12 text-base shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-warm-800 dark:text-dark-100 truncate">
                        {pal.name}
                      </p>
                      {pal.isPublic ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          Public
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-warm-100 dark:bg-dark-700 text-warm-500 dark:text-dark-400">
                          Private
                        </span>
                      )}
                    </div>
                    {activeTab !== 'mine' && (
                      <p className="text-xs text-warm-400 dark:text-dark-500 mt-0.5">
                        by @{pal.createdByUsername}
                      </p>
                    )}
                    <p className="text-xs text-warm-500 dark:text-dark-400 mt-0.5 truncate">
                      {pal.language} · {pal.languageLevel} · {pal.country}
                    </p>
                    {pal.description && (
                      <p className="text-sm text-warm-600 dark:text-dark-300 mt-1 line-clamp-2">
                        {pal.description}
                      </p>
                    )}
                    {!isOwner && (
                      <p className="text-xs text-warm-500 dark:text-dark-200 mt-1">
                        by @{pal.createdByUsername}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={chatPathForPal(pal.id)}
                      className="p-2 rounded-lg text-warm-500 dark:text-dark-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-warm-100 dark:hover:bg-dark-700 transition"
                      title="Chat with pal"
                      aria-label={`Chat with ${pal.name}`}
                    >
                      <i className="fas fa-comment text-sm" aria-hidden="true" />
                    </Link>
                    {isOwner && activeTab === 'mine' && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/pals/${pal.id}/edit`)}
                          className="p-2 rounded-lg text-warm-500 dark:text-dark-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-warm-100 dark:hover:bg-dark-700 transition"
                          title="Edit pal"
                          aria-label={`Edit ${pal.name}`}
                        >
                          <i className="fas fa-pen text-sm" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pal.id, pal.name)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg text-warm-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-warm-100 dark:hover:bg-dark-700 transition disabled:opacity-50"
                          title="Delete pal"
                          aria-label={`Delete ${pal.name}`}
                        >
                          <i className="fas fa-trash text-sm" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}