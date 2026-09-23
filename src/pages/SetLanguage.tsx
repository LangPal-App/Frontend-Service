import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { isSupportedLanguage } from '../i18n/languages';

export default function SetLanguage() {
  const { lang = '' } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupportedLanguage(lang)) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;

    void i18n.changeLanguage(lang).then(() => {
      if (cancelled) return;

      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
      if (idx > 0) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [i18n, lang, navigate]);

  return null;
}
