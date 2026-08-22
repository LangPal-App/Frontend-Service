import { langpalApi } from './emptyApi';
import type {
  ApiEnvelope,
  CreatePalRequest,
  Paginated,
  Pal,
  PalImageUpload,
  UpdatePalRequest,
} from './types';
import { unwrapList } from './types';

export interface GetPalsArgs {
  page?: number;
  limit?: number;
}

export const palsApi = langpalApi.injectEndpoints({
  endpoints: (builder) => ({
    getPals: builder.query<Paginated<Pal[]>, GetPalsArgs | void>({
      query: (params) => ({
        url: '/chat-service/pals',
        params:
          params && (params.page != null || params.limit != null)
            ? { page: params.page, limit: params.limit }
            : undefined,
      }),
      transformResponse: (response: ApiEnvelope<Pal[]>) => ({
        items: unwrapList(response.data),
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((pal) => ({ type: 'Pals' as const, id: pal.id })),
              { type: 'Pals', id: 'LIST' },
            ]
          : [{ type: 'Pals', id: 'LIST' }],
    }),

    getMyPals: builder.query<Pal[], void>({
      query: () => '/chat-service/pals/my-pals',
      transformResponse: (response: ApiEnvelope<Pal[]>) => unwrapList(response.data),
      providesTags: (result) =>
        result
          ? [
              ...result.map((pal) => ({ type: 'MyPals' as const, id: pal.id })),
              { type: 'MyPals', id: 'LIST' },
            ]
          : [{ type: 'MyPals', id: 'LIST' }],
    }),

    uploadPalImage: builder.mutation<PalImageUpload, File>({
      query: (file) => {
        const body = new FormData();
        body.append('image', file);
        return {
          url: '/chat-service/pals/images',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: ApiEnvelope<PalImageUpload>) => response.data,
    }),

    createPal: builder.mutation<Pal, CreatePalRequest>({
      query: (body) => ({
        url: '/chat-service/pals',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<Pal>) => response.data,
      invalidatesTags: [
        { type: 'Pals', id: 'LIST' },
        { type: 'MyPals', id: 'LIST' },
      ],
    }),

    updatePal: builder.mutation<Pal, { palId: string; body: UpdatePalRequest }>({
      query: ({ palId, body }) => ({
        url: `/chat-service/pals/${encodeURIComponent(palId)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<Pal>) => response.data,
      invalidatesTags: (_result, _error, { palId }) => [
        { type: 'Pals', id: palId },
        { type: 'Pals', id: 'LIST' },
        { type: 'MyPals', id: palId },
        { type: 'MyPals', id: 'LIST' },
      ],
    }),

    deletePal: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (palId) => ({
        url: `/chat-service/pals/${encodeURIComponent(palId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, palId) => [
        { type: 'Pals', id: palId },
        { type: 'Pals', id: 'LIST' },
        { type: 'MyPals', id: palId },
        { type: 'MyPals', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPalsQuery,
  useGetMyPalsQuery,
  useUploadPalImageMutation,
  useCreatePalMutation,
  useUpdatePalMutation,
  useDeletePalMutation,
} = palsApi;
