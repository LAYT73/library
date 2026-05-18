import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { buildListParams, type ListQueryParams } from '../../shared/types/list';
import type { Copy, PaginatedResponse } from '../../shared/types';

export const useCopies = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['copies', params],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<Copy>>('/copies', {
        params: buildListParams(params),
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
