import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useCreatePalMutation,
  useGetMyPalsQuery,
  useUpdatePalMutation,
  useUploadPalImageMutation,
} from '../api/palsApi';
import type { CreatePalRequest } from '../api/types';
import { getErrorMessage } from '../api/errors';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import {
  getDefaultRegionForLanguage,
  getRegionsForLanguage,
  isRegionValidForLanguage,
  LANGUAGE_LEVELS,
  LANGUAGES,
} from '../constants/palLocales';

const selectClassName =
  'w-full px-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition';

const emptyForm: CreatePalRequest = {
  name: '',
  description: '',
  language: '',
  country: '',
  languageLevel: 'B1',
  isPublic: false,
  image: undefined,
};

export default function PalForm() {
  const { palId } = useParams<{ palId: string }>();
  const isEdit = Boolean(palId);
  const navigate = useNavigate();

  const { data: myPals, isLoading: palsLoading } = useGetMyPalsQuery(undefined, {
    skip: !isEdit,
  });
  const existingPal = isEdit ? myPals?.find((p) => p.id === palId) : undefined;

  const [form, setForm] = useState<CreatePalRequest>(emptyForm);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [uploadImage] = useUploadPalImageMutation();
  const [createPal, { isLoading: isCreating, error: createError }] = useCreatePalMutation();
  const [updatePal, { isLoading: isUpdating, error: updateError }] = useUpdatePalMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  const availableRegions = getRegionsForLanguage(form.language);
  const isKnownLanguage = LANGUAGES.some((language) => language.code === form.language);

  useEffect(() => {
    if (existingPal) {
      setForm({
        name: existingPal.name,
        description: existingPal.description,
        language: existingPal.language,
        country: existingPal.country,
        languageLevel: existingPal.languageLevel,
        isPublic: existingPal.isPublic,
        image: existingPal.image ?? undefined,
      });
      setImageUrl(existingPal.image);
    }
  }, [existingPal]);

  const isValid =
    form.name.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.language.trim().length > 0 &&
    form.country.trim().length > 0 &&
    form.languageLevel.trim().length > 0;

  function handleLanguageChange(languageCode: string) {
    setForm((prev) => {
      const nextCountry = isRegionValidForLanguage(languageCode, prev.country)
        ? prev.country
        : getDefaultRegionForLanguage(languageCode);

      return {
        ...prev,
        language: languageCode,
        country: nextCountry,
      };
    });
  }

  async function handleImageUpload(file: File): Promise<string> {
    const result = await uploadImage(file).unwrap();
    setImageUrl(result.url);
    setForm((prev) => ({ ...prev, image: result.url }));
    return result.url;
  }

  function handleClearImage() {
    setImageUrl(null);
    setForm((prev) => ({ ...prev, image: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setSuccessMessage(null);
    if (!isValid || isLoading) return;

    const body: CreatePalRequest = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      language: form.language.trim(),
      country: form.country.trim(),
      image: imageUrl ?? undefined,
    };

    try {
      if (isEdit && palId) {
        await updatePal({ palId, body }).unwrap();
      } else {
        await createPal(body).unwrap();
      }
      navigate('/pals', { replace: true });
    } catch {
      // Hook `error` is shown below.
    }
  }

  if (isEdit && palsLoading) {
    return (
      <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900">
        <PageHeader backTo="/pals" backLabel="Pals" title="Edit pal" />
        <p className="text-sm text-warm-500 dark:text-dark-400 py-16 text-center">Loading pal…</p>
      </div>
    );
  }

  if (isEdit && !palsLoading && !existingPal) {
    return (
      <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900">
        <PageHeader backTo="/pals" backLabel="Pals" title="Edit pal" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-warm-600 dark:text-dark-300 mb-4">Pal not found or you don&apos;t have access.</p>
          <Link
            to="/pals"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to pals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-dark-900">
      <PageHeader
        backTo="/pals"
        backLabel="Pals"
        title={isEdit ? 'Edit pal' : 'Create pal'}
      />

      <div className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-dark-800 border border-warm-200 dark:border-dark-700 rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-warm-800 dark:text-dark-100">
            {isEdit ? 'Update your pal' : 'Create a new pal'}
          </h2>
          <p className="mt-1 mb-6 text-sm text-warm-500 dark:text-dark-400">
            Upload an avatar first, then fill in the details below.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <ImageUploadField
              label="Pal avatar"
              imageUrl={imageUrl}
              onUpload={handleImageUpload}
              onClear={handleClearImage}
              disabled={isLoading}
            />

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sofia"
                className="w-full px-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
              />
              {touched && !form.name.trim() && (
                <span className="block mt-1 text-xs text-red-500">Name is required.</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Personality, teaching style, topics they enjoy…"
                rows={3}
                className="w-full px-3 py-2.5 bg-warm-100 dark:bg-dark-700 border border-warm-200 dark:border-dark-600 rounded-xl text-sm text-warm-800 dark:text-dark-100 placeholder-warm-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 transition"
              />
              {touched && !form.description.trim() && (
                <span className="block mt-1 text-xs text-red-500">Description is required.</span>
              )}
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                  Language
                </span>
                <select
                  value={form.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={selectClassName}
                >
                  <option value="" disabled>
                    Select a language
                  </option>
                  {form.language && !isKnownLanguage && (
                    <option value={form.language}>{form.language}</option>
                  )}
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
                {touched && !form.language.trim() && (
                  <span className="block mt-1 text-xs text-red-500">Required.</span>
                )}
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                  Country / Region
                </span>
                <select
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  disabled={!form.language}
                  className={`${selectClassName} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    {form.language ? 'Select a country / region' : 'Select a language first'}
                  </option>
                  {form.country &&
                    !availableRegions.some((region) => region.code === form.country) && (
                      <option value={form.country}>{form.country}</option>
                    )}
                  {availableRegions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.label}
                    </option>
                  ))}
                </select>
                {touched && !form.country.trim() && (
                  <span className="block mt-1 text-xs text-red-500">Required.</span>
                )}
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-1.5">
                Language level
              </span>
              <select
                value={form.languageLevel}
                onChange={(e) => setForm((prev) => ({ ...prev, languageLevel: e.target.value }))}
                className={selectClassName}
              >
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
                {form.languageLevel && !LANGUAGE_LEVELS.includes(form.languageLevel as typeof LANGUAGE_LEVELS[number]) && (
                  <option value={form.languageLevel}>{form.languageLevel}</option>
                )}
              </select>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-warm-300 dark:border-dark-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-semibold text-warm-800 dark:text-dark-100">
                  Make public
                </span>
                <span className="block text-xs text-warm-500 dark:text-dark-400 mt-0.5">
                  Public pals can be discovered and chatted with by other users.
                </span>
              </span>
            </label>

            {error != null && (
              <p className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {getErrorMessage(error, isEdit ? 'Could not update pal.' : 'Could not create pal.')}
              </p>
            )}

            {successMessage && (
              <p className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs">
                {successMessage}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                to="/pals"
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-center text-warm-700 dark:text-dark-200 border border-warm-300 dark:border-dark-600 hover:border-warm-400 dark:hover:border-dark-500 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
              >
                {isLoading && <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />}
                {isLoading ? 'Saving…' : isEdit ? 'Save changes' : 'Create pal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
