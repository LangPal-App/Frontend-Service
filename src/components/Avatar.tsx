import { resolveMediaUrl } from '../api/media';

interface AvatarProps {
  name: string;
  image?: string | null;
  initials?: string;
  className?: string;
}

export default function Avatar({ name, image, initials, className = '' }: AvatarProps) {
  const src = resolveMediaUrl(image);
  const label = initials || name.trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`rounded-full object-cover bg-warm-200 dark:bg-dark-700 ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold ${className}`}
    >
      {label}
    </div>
  );
}
