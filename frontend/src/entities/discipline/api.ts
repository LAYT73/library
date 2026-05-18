import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Discipline, PaginatedResponse } from '../../shared/types';

import { buildListParams, type ListQueryParams } from '../../shared/types/list';

export const useDisciplines = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['disciplines', params],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<Discipline>>('/disciplines', {
        params: buildListParams(params),
      });
      return res.data;
    },
  });
};

export const useCreateDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; department: string }) => {
      const res = await apiClient.getClient().post<Discipline>('/disciplines', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disciplines'] }),
  });
};

export const useUpdateDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name?: string; department?: string } }) => {
      const res = await apiClient.getClient().patch<Discipline>(`/disciplines/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disciplines'] }),
  });
};

export const useDeleteDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/disciplines/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disciplines'] }),
  });
};
