import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      const res = await apiClient.getClient().post<Supplier>('/suppliers', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Supplier> }) => {
      const res = await apiClient.getClient().patch<Supplier>(`/suppliers/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete<Supplier>(`/suppliers/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};
