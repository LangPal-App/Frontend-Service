import { langpalApi } from '../../api';
import type { AppDispatch } from '../../app/store';
import { logout } from './authSlice';

export function logoutUser() {
  return (dispatch: AppDispatch) => {
    dispatch(logout());
    dispatch(langpalApi.util.resetApiState());
  };
}
