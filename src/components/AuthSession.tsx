import { useEffect } from 'react';
import { useGetProfileQuery } from '../api/authApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setUser } from '../features/auth/authSlice';
import { mapApiUser } from '../features/auth/authStorage';

export default function AuthSession() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { data } = useGetProfileQuery(undefined, { skip: !token });

  useEffect(() => {
    if (data) {
      dispatch(setUser(mapApiUser(data)));
    }
  }, [data, dispatch]);

  return null;
}
