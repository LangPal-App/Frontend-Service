import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setPendingEmail } from '../features/auth/authSlice';

export default function Signup() {
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
    } catch {
      // Hook `error` is shown below.
    }
  }

  return (
    <div className="h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-warm-800 dark:text-dark-100">Create your account</h1>
          <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">
            We’ll send a verification code to your email.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Name
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
                  placeholder="Jordan Lee"
                  autoComplete="name"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {touched && !name.trim() && (
                <span className="block mt-1 text-xs text-red-500">Enter your name.</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Username
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
                  placeholder="jordanlee"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {touched && !username.trim() && (
                <span className="block mt-1 text-xs text-red-500">Choose a username.</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Email
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
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {touched && !email.trim() && (
                <span className="block mt-1 text-xs text-red-500">Enter your email.</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Password
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
                />
              </div>
              {touched && password.length > 0 && password.length < 6 && (
                <span className="block mt-1 text-xs text-red-500">Use at least 6 characters.</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Confirm password
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
              {touched && confirmPassword.length > 0 && !passwordsMatch && (
                <span className="block mt-1 text-xs text-red-500">Passwords don't match.</span>
              )}
            </label>

            {error as string  && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(error, 'Could not create your account.')}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
              {isLoading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-500 dark:text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
