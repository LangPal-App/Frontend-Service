export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  initials: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  pendingEmail: string | null;
}

export interface StoredAuth {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}
