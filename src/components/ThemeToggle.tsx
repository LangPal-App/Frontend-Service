import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleTheme } from '../features/theme/themeSlice';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      title={t('theme.toggle')}
      aria-label={t('theme.toggle')}
      className={`p-2 rounded-full text-warm-500 hover:text-indigo-600 hover:bg-warm-200 dark:text-dark-300 dark:hover:text-indigo-400 dark:hover:bg-dark-700 transition ${className}`}
    >
      <i className={isDark ? 'fas fa-circle-half-stroke text-lg' : 'fas fa-moon text-lg'} aria-hidden="true" />
    </button>
  );
}
