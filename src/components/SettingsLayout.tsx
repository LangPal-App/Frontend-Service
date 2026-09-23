import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from './PageHeader';

export default function SettingsLayout() {
  const { t } = useTranslation(['settings', 'common']);

  const navItems = [
    { to: '/settings/profile', label: t('profile.nav'), icon: 'fa-user' },
    { to: '/settings/password', label: t('password.nav'), icon: 'fa-lock' },
  ];

  return (
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <PageHeader backTo="/chat" backLabel={t('common:back.chat')} title={t('title')} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <nav
          className="flex gap-2 mb-8 p-1 bg-warm-100 dark:bg-dark-800 rounded-xl border border-warm-200 dark:border-dark-700"
          aria-label={t('navLabel')}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white dark:bg-dark-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-warm-600 dark:text-dark-300 hover:text-warm-800 dark:hover:text-dark-100'
                }`
              }
            >
              <i className={`fas ${item.icon}`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
