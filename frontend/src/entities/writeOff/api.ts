import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Book, Copy } from '../../shared/types';

export interface WriteOffCopyItem {
  id: number;
  copyId: number;
  copy?: Copy & { book?: Book };
}

export interface WriteOffListItem {
  id: number;
  reason: string;
  date: string;
  items: WriteOffCopyItem[];
}

export interface PaginatedWriteOffResponse {
  data: WriteOffListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const useWriteOffs = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['write-offs', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedWriteOffResponse>('/write-offs', { params: { skip, take } });
      return res.data;
    },
  });
};

export const useCreateWriteOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { reason: string; copyIds: number[] }) => {
      const res = await apiClient.getClient().post('/write-offs', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['write-offs'] }),
  });
};

export const useUpdateWriteOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { reason?: string; copyIds?: number[] } }) => {
      const res = await apiClient.getClient().patch(`/write-offs/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['write-offs'] }),
  });
};

export const useDeleteWriteOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/write-offs/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['write-offs'] }),
  });
};
