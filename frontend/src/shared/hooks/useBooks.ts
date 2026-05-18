import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { buildListParams, type ListQueryParams } from '../types/list';
import type { Book, PaginatedResponse } from '../types';

export const useBooks = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const response = await apiClient
        .getClient()
        .get<PaginatedResponse<Book>>('/books', {
          params: buildListParams(params),
        });
      return response.data;
    },
  });
};

export const useBook = (id: number) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async () => {
      const response = await apiClient
        .getClient()
        .get<Book>(`/books/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
