import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_NATIVE_NAMES,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../i18n/languages';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const current = normalizeLanguage(i18n.language);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus();
      return;
    }

    const firstOption = panelRef.current?.querySelector<HTMLButtonElement>('[data-lang-option]');
    firstOption?.focus();
  }, [open]);

  function selectLanguage(code: SupportedLanguage) {
    if (code !== current) {
      void i18n.changeLanguage(code);
    }
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={t('chooseLanguage')}
        aria-label={t('chooseLanguage')}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold
          text-warm-700 dark:text-dark-200 hover:bg-warm-100 dark:hover:bg-dark-800 transition"
      >
        <i className="fas fa-globe text-base text-warm-500 dark:text-dark-300" aria-hidden="true" />
        <span className="hidden sm:inline max-w-[7.5rem] truncate">{LANGUAGE_NATIVE_NAMES[current]}</span>
        <span className="sm:hidden uppercase tracking-wide text-xs text-warm-500 dark:text-dark-400">
          {current}
        </span>
        <i
          className="fas fa-chevron-down text-[10px] text-warm-400 dark:text-dark-400 hidden sm:inline"
          aria-hidden="true"
        />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
            <div
              className="absolute inset-0 bg-black/35 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`relative z-10 flex h-full w-full max-w-[min(100%,20rem)] sm:max-w-sm flex-col
                bg-warm-50 dark:bg-dark-900 border-s border-warm-200 dark:border-dark-700 shadow-2xl
                animate-lang-slide-in`}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-warm-200 dark:border-dark-700">
                <div className="min-w-0">
                  <p
                    id={titleId}
                    className="text-base font-bold text-warm-800 dark:text-dark-100 tracking-tight"
                  >
                    {t('chooseLanguage')}
                  </p>
                  <p className="text-xs text-warm-500 dark:text-dark-400 truncate mt-0.5">
                    {LANGUAGE_NATIVE_NAMES[current]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full text-warm-500 hover:text-warm-800 hover:bg-warm-200
                    dark:text-dark-300 dark:hover:text-dark-100 dark:hover:bg-dark-700 transition"
                  aria-label={t('close')}
                >
                  <i className="fas fa-xmark text-lg" aria-hidden="true" />
                </button>
              </div>

              <nav
                className="flex-1 overflow-y-auto custom-scroll px-3 py-3 space-y-0.5"
                aria-label={t('chooseLanguage')}
              >
                {SUPPORTED_LANGUAGES.map((code) => {
                  const selected = code === current;
                  return (
                    <button
                      key={code}
                      type="button"
                      data-lang-option
                      onClick={() => selectLanguage(code)}
                      aria-current={selected ? 'true' : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-start transition
                        ${
                          selected
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'text-warm-800 dark:text-dark-100 hover:bg-warm-100 dark:hover:bg-dark-800'
                        }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wide
                          ${
                            selected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-warm-200 dark:bg-dark-700 text-warm-600 dark:text-dark-300'
                          }`}
                      >
                        {code}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate">
                          {LANGUAGE_NATIVE_NAMES[code]}
                        </span>
                        <span className="block text-xs text-warm-500 dark:text-dark-400 truncate">
                          {t(`languages.${code}`)}
                        </span>
                      </span>
                      {selected && (
                        <i
                          className="fas fa-check text-indigo-500 dark:text-indigo-400 text-sm"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
