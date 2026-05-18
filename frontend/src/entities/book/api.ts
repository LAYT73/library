import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Book } from '../../shared/types';

export const useCreateBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Book>) => {
      const res = await apiClient.getClient().post<Book>('/books', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
