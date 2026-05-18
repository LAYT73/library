import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { PaginatedResponse } from '../../shared/types';

import { buildListParams, type ListQueryParams } from '../../shared/types/list';

export const useKnowledgeAreas = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['knowledgeAreas', params],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<any>>('/knowledge-areas', {
        params: buildListParams(params),
      });
      return res.data;
    },
  });
};

export const useCreateKnowledgeArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await apiClient.getClient().post('/knowledge-areas', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledgeAreas'] }),
  });
};

export const useUpdateKnowledgeArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name?: string } }) => {
      const res = await apiClient.getClient().patch(`/knowledge-areas/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledgeAreas'] }),
  });
};

export const useDeleteKnowledgeArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/knowledge-areas/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledgeAreas'] }),
  });
};
