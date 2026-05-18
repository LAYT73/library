import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Copy } from '../../shared/types';

export const useCopies = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['copies', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<{ data: Copy[]; total: number; page: number; pageSize: number }>('/copies', {
        params: { skip, take },
      });
      return res.data;
    },
  });
};

export const useCreateCopy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Copy>) => {
      const res = await apiClient.getClient().post<Copy>('/copies', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['copies'] }),
  });
};

export const useChangeCopyStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiClient.getClient().patch<Copy>(`/copies/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['copies'] }),
  });
};
