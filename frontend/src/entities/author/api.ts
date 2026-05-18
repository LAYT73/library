import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Author } from '../../shared/types';

export const useAuthors = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['authors', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<{ data: Author[]; total: number; page: number; pageSize: number }>('/authors', {
        params: { skip, take },
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
