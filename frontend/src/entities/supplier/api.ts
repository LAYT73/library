import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Supplier } from '../../shared/types';

export const useSuppliers = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['suppliers', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<{ data: Supplier[]; total: number; page: number; pageSize: number }>('/suppliers', {
        params: { skip, take },
      });
      return res.data;
    },
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      const res = await apiClient.getClient().post<Supplier>('/suppliers', payload);
      return res.data;
    },
  });
};
