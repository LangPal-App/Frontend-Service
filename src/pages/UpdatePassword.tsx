import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdatePasswordMutation } from '../api/authApi';
import { getErrorMessage } from '../api/errors';

export default function UpdatePassword() {
  const { t } = useTranslation('settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updatePassword, { isLoading, error }] = useUpdatePasswordMutation();

  const passwordsMatch = newPassword === confirmPassword;
  const isValid =
    currentPassword.length > 0 && newPassword.length >= 6 && passwordsMatch;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setSuccessMessage(null);
    if (!isValid || isLoading) return;

    try {
      await updatePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTouched(false);
      setSuccessMessage(t('password.success'));
    } catch {
      // Hook `error` is shown below.
    }
  }

  return (
    <div className="bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-warm-800 dark:text-dark-100">{t('password.title')}</h2>
      <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">{t('password.subtitle')}</p>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <PasswordField
          label={t('password.current')}
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          showError={touched && !currentPassword}
          errorMessage={t('password.currentRequired')}
        />

        <PasswordField
          label={t('password.new')}
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          showError={touched && newPassword.length > 0 && newPassword.length < 6}
          errorMessage={t('password.minLength')}
        />

        <PasswordField
          label={t('password.confirm')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          showError={touched && confirmPassword.length > 0 && !passwordsMatch}
          errorMessage={t('password.mismatch')}
        />

        {error != null && (
          <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
            {getErrorMessage(error, t('password.error'))}
          </p>
        )}

        {successMessage && (
          <p className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
        >
          {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
          {isLoading ? t('password.updating') : t('password.update')}
        </button>
      </form>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  showError,
  errorMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showError: boolean;
  errorMessage: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
        {label}
      </span>
      <div className="relative">
        <i
          className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-dark-400 text-sm"
          aria-hidden="true"
        />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
        />
      </div>
      {showError && <span className="block mt-1 text-xs text-red-500">{errorMessage}</span>}
    </label>
  );
}
