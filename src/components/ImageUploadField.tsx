import { useRef, useState, type ChangeEvent } from 'react';
import { resolveMediaUrl } from '../api/media';

interface ImageUploadFieldProps {
  label: string;
  imageUrl: string | null;
  onUpload: (file: File) => Promise<string>;
  onClear?: () => void;
  disabled?: boolean;
  hint?: string;
}

export default function ImageUploadField({
  label,
  imageUrl,
  onUpload,
  onClear,
  disabled = false,
  hint = 'PNG, JPG or WebP · max 5 MB',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = resolveMediaUrl(imageUrl);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <span className="block text-xs font-semibold text-warm-600 dark:text-dark-300 mb-2">
        {label}
      </span>

      <div className="flex items-start gap-4">
        <div
          className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed transition
            ${previewSrc ? 'border-transparent' : 'border-warm-300 dark:border-dark-600 bg-warm-100 dark:bg-dark-700'}
            ${isUploading ? 'opacity-60' : ''}`}
        >
          {previewSrc ? (
            <img src={previewSrc} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-warm-400 dark:text-dark-500">
              <i className="fas fa-image text-2xl" aria-hidden="true" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <i className="fas fa-circle-notch fa-spin text-white text-lg" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="sr-only"
            aria-label={`Upload ${label.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
          >
            <i className="fas fa-cloud-arrow-up" aria-hidden="true" />
            {previewSrc ? 'Change image' : 'Upload image'}
          </button>
          {previewSrc && onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled || isUploading}
              className="block text-xs text-warm-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 transition"
            >
              Remove image
            </button>
          )}
          <p className="text-xs text-warm-400 dark:text-dark-500">{hint}</p>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
