import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../app/hooks';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

function navLinkClass(isActive: boolean) {
  return `px-3 py-2 rounded-xl text-sm font-semibold transition ${
    isActive
      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
      : 'text-warm-700 dark:text-dark-200 hover:bg-warm-100 dark:hover:bg-dark-800'
  }`;
}

export default function Header() {
  const { t } = useTranslation('common');
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-warm-50/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-warm-200 dark:border-dark-700">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link
          to={isAuthenticated ? '/chat' : '/'}
          className="inline-flex items-center gap-2 text-warm-800 dark:text-dark-100 font-bold text-lg shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
            <img src="/logo2.webp" alt="" className="w-6 h-6 object-contain" />
          </span>
          {t('brand')}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <nav className="flex items-center gap-1" aria-label={t('nav.main')}>
              <NavLink to="/pals" className={({ isActive }) => navLinkClass(isActive)}>
                {t('nav.pals')}
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => navLinkClass(isActive)}>
                {t('nav.settings')}
              </NavLink>
            </nav>
          ) : (
            <nav className="flex items-center gap-1 sm:gap-2" aria-label={t('nav.main')}>
              <NavLink to="/login" className={({ isActive }) => `hidden sm:inline-flex ${navLinkClass(isActive)}`}>
                {t('nav.logIn')}
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm transition"
              >
                {t('nav.getStarted')}
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
