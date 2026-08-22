import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const langpalApi = createApi({
  reducerPath: 'langpalApi',
  baseQuery,
  tagTypes: ['Auth', 'Pals', 'MyPals', 'Chats'],
  endpoints: () => ({}),
});
