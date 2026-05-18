import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { buildListParams, type ListQueryParams } from '../../shared/types/list';
import type { Author, PaginatedResponse } from '../../shared/types';

export const useAuthors = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['authors', params],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<Author>>('/authors', {
        params: buildListParams(params),
      });
      return res.data;
    },
  });
};

export const useCreateAuthor = () => {
  return useMutation({
    mutationFn: async (payload: Partial<Author>) => {
      const res = await apiClient.getClient().post<Author>('/authors', payload);
      return res.data;
    },
    onSuccess: () => {
      // callers may invalidate queries
    },
  });
};
