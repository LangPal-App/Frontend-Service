import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../app/hooks';

const featureKeys = ['practice', 'build', 'realtime'] as const;
const featureIcons = {
  practice: 'fa-globe',
  build: 'fa-user-group',
  realtime: 'fa-bolt',
} as const;

const languageChips = ['Spanish', 'French', 'Japanese', 'Arabic', 'German', 'Korean'] as const;

const demoPals = [
  { name: 'Sofia', langKey: 'sofia', color: 'from-rose-400 to-orange-400' },
  { name: 'Kenji', langKey: 'kenji', color: 'from-blue-400 to-cyan-400' },
  { name: 'Amélie', langKey: 'amelie', color: 'from-violet-400 to-purple-400' },
] as const;

export default function Home() {
  const { t } = useTranslation('home');
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900 overflow-x-hidden">
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-4 sm:pt-2 pb-20 sm:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="mx-auto mb-2 mt-0 w-56 h-56 sm:w-[22rem] sm:h-[22rem] flex items-center justify-center">
            <img
              src="logo.webp"
              alt={t('logoAlt')}
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500"
              style={{ objectFit: 'cover', border: '3px solid rgba(125, 89, 255, 0.11)' }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6">
            <i className="fas fa-sparkles" aria-hidden="true" />
            {t('badge')}
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-warm-900 dark:text-dark-50 leading-[1.1]">
            {t('headlineBefore')}{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {t('headlineHighlight')}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-warm-600 dark:text-dark-300 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition inline-flex items-center justify-center gap-2"
            >
              {t('ctaStart')}
              <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-warm-700 dark:text-dark-200 border border-warm-300 dark:border-dark-600 hover:border-warm-400 dark:hover:border-dark-500 transition"
            >
              {t('ctaAccount')}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            {demoPals.map((pal, i) => (
              <div
                key={pal.name}
                className={`bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl p-3 sm:p-4 shadow-lg ${i === 1 ? 'sm:-translate-y-3' : ''}`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${pal.color} mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm`}
                >
                  {pal.name.charAt(0)}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-warm-800 dark:text-dark-100 truncate">
                  {pal.name}
                </p>
                <p className="text-[10px] sm:text-xs text-warm-500 dark:text-dark-400 truncate">
                  {t(`demoPals.${pal.langKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-warm-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-warm-800 dark:text-dark-100 mb-10">
            {t('featuresTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {featureKeys.map((key) => (
              <div
                key={key}
                className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <i className={`fas ${featureIcons[key]}`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-warm-800 dark:text-dark-100 mb-2">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-sm text-warm-500 dark:text-dark-400 leading-relaxed">
                  {t(`features.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-warm-200 dark:border-dark-700 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 dark:text-dark-500 mb-4">
            {t('languagesLabel')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {languageChips.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-warm-100 dark:bg-dark-800 text-warm-600 dark:text-dark-300 border border-warm-200 dark:border-dark-700"
              >
                {lang}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {t('languagesMore')}
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-warm-200 dark:border-dark-700 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-warm-500 dark:text-dark-400">
            {t('footerTagline', { year: new Date().getFullYear() })}
          </p>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition"
          >
            {t('footerCta')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
