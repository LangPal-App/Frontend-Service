import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useUpdateProfileImageMutation,
  useUpdateProfileMutation,
} from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import ImageUploadField from '../components/ImageUploadField';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setUser } from '../features/auth/authSlice';
import { mapApiUser } from '../features/auth/authStorage';
import Avatar from '../components/Avatar';

export default function UpdateProfile() {
  const { t } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updateProfile, { isLoading: isUpdatingProfile, error: profileError }] =
    useUpdateProfileMutation();
  const [updateProfileImage, { isLoading: isUpdatingImage, error: imageError }] =
    useUpdateProfileImageMutation();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const isValid = name.trim().length > 0;
  const isLoading = isUpdatingProfile || isUpdatingImage;
  const error = profileError || imageError;

  async function handleImageUpload(file: File): Promise<string> {
    const { profileImage } = await updateProfileImage(file).unwrap();
    const nextImage = profileImage ?? '';
    if (user) {
      dispatch(setUser({ ...user, profileImage: nextImage }));
    }
    return nextImage;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setSuccessMessage(null);
    if (!isValid || isLoading) return;

    try {
      const updatedUser = await updateProfile({ name: name.trim() }).unwrap();
      dispatch(setUser(mapApiUser(updatedUser)));
      setSuccessMessage(t('profile.success'));
    } catch {
      // Hook `error` is shown below.
    }
  }

  return (
    <div className="bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-warm-800 dark:text-dark-100">{t('profile.title')}</h2>
      <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">{t('profile.subtitle')}</p>

      <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-warm-50 dark:bg-dark-900/50 border border-warm-200 dark:border-dark-700">
        <Avatar
          name={user?.name ?? t('profile.you')}
          image={user?.profileImage}
          initials={user?.initials}
          className="w-14 h-14 text-lg shrink-0"
        />
        <div className="min-w-0">
          <p className="font-semibold text-warm-800 dark:text-dark-100 truncate">{user?.name}</p>
          <p className="text-sm text-warm-500 dark:text-dark-400 truncate">@{user?.username}</p>
          <p className="text-xs text-warm-400 dark:text-dark-500 truncate">{user?.email}</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <ImageUploadField
          label={t('profile.photo')}
          imageUrl={user?.profileImage ?? null}
          onUpload={handleImageUpload}
          disabled={isLoading}
        />

        <label className="block">
          <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
            {t('profile.displayName')}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile.namePlaceholder')}
            autoComplete="name"
            className="w-full px-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
          />
          {touched && !name.trim() && (
            <span className="block mt-1 text-xs text-red-500">{t('profile.nameRequired')}</span>
          )}
        </label>

        {error != null && (
          <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
            {getErrorMessage(error, t('profile.error'))}
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
          {isUpdatingProfile && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
          {isUpdatingProfile ? t('profile.saving') : t('profile.save')}
        </button>
      </form>
    </div>
  );
}
