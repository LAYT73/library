import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Book, PaginatedResponse } from '../types';

export const useBooks = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['books', skip, take],
    queryFn: async () => {
      const response = await apiClient
        .getClient()
        .get<PaginatedResponse<Book>>('/books', {
          params: { skip, take },
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
