import { createSlice } from '@reduxjs/toolkit';
import type { ThemeState } from '../../types/theme';

const STORAGE_KEY = 'thread.theme';

function readInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return Boolean(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

const initialState: ThemeState = {
  isDark: readInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
      localStorage.setItem(STORAGE_KEY, state.isDark ? 'dark' : 'light');
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
