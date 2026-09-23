import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResendOtpMutation, useVerifyOtpMutation } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCredentials, setPendingEmail } from '../features/auth/authSlice';
import { mapApiUser } from '../features/auth/authStorage';

interface VerifyLocationState {
  email?: string;
}

export default function VerifyOtp() {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, pendingEmail } = useAppSelector((state) => state.auth);

  const locationEmail = (location.state as VerifyLocationState | null)?.email;
  const [email, setEmail] = useState(locationEmail || pendingEmail || '');
  const [otp, setOtp] = useState(import.meta.env.VITE_ENV === 'demo' ? '123456' : '');
  const [touched, setTouched] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending, error: resendError }] = useResendOtpMutation();

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  const isValid = email.trim().length > 0 && otp.trim().length >= 4;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setResendMessage(null);
    if (!isValid || isLoading) return;

    try {
      const session = await verifyOtp({ email: email.trim(), otp: otp.trim() }).unwrap();
      dispatch(setCredentials({ token: session.token, user: mapApiUser(session.user) }));
      navigate('/chat', { replace: true });
    } catch {
      // Hook `error` is shown below.
    }
  }

  async function handleResend() {
    if (!email.trim() || isResending || cooldown > 0) return;
    try {
      const result = await resendOtp({ email: email.trim() }).unwrap();
      dispatch(setPendingEmail(email.trim()));
      setResendMessage(result.message || t('verify.resendDefault'));
      setCooldown(30);
    } catch {
      // Hook error from verify is separate; resend failures use the same banner via unwrap.
    }
  }

  return (
    <div className="h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-warm-800 dark:text-dark-100">{t('verify.title')}</h1>
          <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">{t('verify.subtitle')}</p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('verify.email')}
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
              {touched && !email.trim() && (
                <span className="block mt-1 text-xs text-red-500">{t('verify.emailRequired')}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                {t('verify.code')}
              </span>
              <div className="relative">
                <i
                  className="fas fa-key absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                  placeholder="123456"
                  maxLength={8}
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm tracking-widest text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {touched && otp.trim().length < 4 && (
                <span className="block mt-1 text-xs text-red-500">{t('verify.codeRequired')}</span>
              )}
            </label>

            {error as string && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(error, t('verify.error'))}
              </p>
            )}

            {resendError as string && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(resendError, t('verify.resendError'))}
              </p>
            )}

            {resendMessage && (
              <p className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                {resendMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
              {isLoading ? t('verify.submitting') : t('verify.submit')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-warm-500 dark:text-dark-400 space-y-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0 || !email.trim()}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0
                ? t('verify.resendIn', { seconds: cooldown })
                : isResending
                  ? t('verify.resending')
                  : t('verify.resend')}
            </button>
            <p>
              {t('verify.alreadyVerified')}{' '}
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                {t('verify.logIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
