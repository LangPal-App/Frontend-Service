import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types/auth';
import { clearPersistedAuth, persistAuth, readStoredAuth } from './authStorage';

const stored = readStoredAuth();

const initialState: AuthState = {
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  isAuthenticated: Boolean(stored?.token && stored?.user),
  pendingEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      const user = { ...action.payload.user, id: String(action.payload.user.id) };
      state.token = action.payload.token;
      state.user = user;
      state.isAuthenticated = true;
      state.pendingEmail = null;
      persistAuth(action.payload.token, user);
    },
    setUser(state, action: PayloadAction<User>) {
      const user = { ...action.payload, id: String(action.payload.id) };
      state.user = user;
      if (state.token) {
        persistAuth(state.token, user);
      }
    },
    setPendingEmail(state, action: PayloadAction<string | null>) {
      state.pendingEmail = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.pendingEmail = null;
      clearPersistedAuth();
    },
  },
});

export const { setCredentials, setUser, setPendingEmail, logout } = authSlice.actions;
export default authSlice.reducer;
