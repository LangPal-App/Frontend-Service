import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterMutation } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setPendingEmail } from '../features/auth/authSlice';

export default function Signup() {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [register, { isLoading, error }] = useRegisterMutation();
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isValid =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    passwordsMatch;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isLoading) return;

    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      }).unwrap();
      dispatch(setPendingEmail(email.trim()));
      navigate('/verify-otp', { replace: true, state: { email: email.trim() } });
    } catch (e: any) {
      setFieldErrors(e?.data?.errors ?? {});
    }
  }

  return (
    <div className="h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-warm-800 dark:text-dark-100">{t('signup.title')}</h1>
          <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">{t('signup.subtitle')}</p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('signup.name')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('signup.namePlaceholder')}
                  autoComplete="name"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.name && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.name[0]}
                </div>
              )}
              {touched && !name.trim() && (
                <span className="block mt-1 text-xs text-red-500">{t('signup.nameRequired')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('signup.username')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-at absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('signup.usernamePlaceholder')}
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.username && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.username[0]}
                </div>
              )}
              {touched && !username.trim() && (
                <span className="block mt-1 text-xs text-red-500">{t('signup.usernameRequired')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('signup.email')}
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
                <span className="block mt-1 text-xs text-red-500">{t('signup.emailRequired')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('signup.password')}
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
                  placeholder={t('signup.passwordPlaceholder')}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.password && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.password[0]}
                </div>
              )}
              {touched && password.length > 0 && password.length < 6 && (
                <span className="block mt-1 text-xs text-red-500">{t('signup.passwordMin')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('signup.confirmPassword')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {fieldErrors?.confirmPassword && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" />
                  {fieldErrors.confirmPassword[0]}
                </div>
              )}
              {touched && confirmPassword.length > 0 && !passwordsMatch && (
                <span className="block mt-1 text-xs text-red-500">{t('signup.passwordMismatch')}</span>
              )}
            </label>

            {error as string && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(error, t('signup.error'))}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
              {isLoading ? t('signup.submitting') : t('signup.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-500 dark:text-dark-400">
            {t('signup.haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {t('signup.logIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
