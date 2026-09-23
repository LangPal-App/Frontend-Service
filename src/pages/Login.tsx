import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { mapApiUser } from '../features/auth/authStorage';

interface LoginLocationState {
  from?: { pathname: string };
}

export default function Login() {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const from = (location.state as LoginLocationState | null)?.from?.pathname ?? '/chat';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const isValid = email.trim().length > 0 && password.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isLoading) return;

    try {
      const session = await login({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials({ token: session.token, user: mapApiUser(session.user) }));
      navigate(from, { replace: true });
    } catch (e: any) {
      setFieldErrors(e?.data?.errors ?? {});
    }
  }

  return (
    <div className="h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-warm-800 dark:text-dark-100">{t('login.title')}</h1>
          <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">{t('login.subtitle')}</p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('fields.email')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('fields.emailPlaceholder')}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.email && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.email[0]}
                </div>
              )}
              {touched && !email.trim() && (
                <span className="block mt-1 text-xs text-red-500">{t('login.emailRequired')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('fields.password')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.password && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.password[0]}
                </div>
              )}
              {touched && !password && (
                <span className="block mt-1 text-xs text-red-500">{t('login.passwordRequired')}</span>
              )}
            </label>

            {error as string && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(error, t('login.error'))}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
              {isLoading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-500 dark:text-dark-400">
            {t('login.newHere')}{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {t('login.createAccount')}
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-warm-500 dark:text-dark-400">
            {t('login.haveCode')}{' '}
            <Link to="/verify-otp" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {t('login.verifyEmail')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
