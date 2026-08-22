import type { ApiUser } from '../../api/types';
import type { StoredAuth, User } from '../../types/auth';

const STORAGE_KEY = 'langpal.auth';

export function initialsFromName(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

export function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    initials: initialsFromName(user.name),
  };
}

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (parsed?.token && parsed?.user?.id) {
      return parsed as StoredAuth;
    }
    return null;
  } catch {
    return null;
  }
}

export function persistAuth(token: string, user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export function clearPersistedAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}
