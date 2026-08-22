import { Link } from 'react-router-dom';

interface PageHeaderProps {
  backTo?: string;
  backLabel?: string;
  title?: string;
}

export default function PageHeader({ backTo = '/', backLabel = 'Home', title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-warm-50/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-warm-200 dark:border-dark-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-dark-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0"
          >
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
            {backLabel}
          </Link>
          {title && (
            <>
              <span className="text-warm-300 dark:text-dark-600" aria-hidden="true">
                /
              </span>
              <h1 className="text-sm font-semibold text-warm-800 dark:text-dark-100 truncate">
                {title}
              </h1>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
