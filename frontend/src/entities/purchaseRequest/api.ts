import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { PurchaseRequest } from '../../shared/types';

export interface PurchaseRequestListItem {
  id: number;
  date: string;
  status: string;
  items: Array<{ id: number; quantity: number; bookId: number }>;
}

export interface PaginatedPurchaseRequestResponse {
  data: PurchaseRequestListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const usePurchaseRequest = (id: number) => {
  return useQuery({
    queryKey: ['purchase-request', id],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PurchaseRequest>(`/purchase-requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const usePurchaseRequests = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['purchase-requests', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedPurchaseRequestResponse>('/purchase-requests', { params: { skip, take } });
      return res.data;
    },
  });
};

export const useCreatePurchaseRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { items: Array<{ bookId: number; quantity: number }> }) => {
      const res = await apiClient.getClient().post('/purchase-requests', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });
};

export const useUpdatePurchaseRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { status?: string } }) => {
      const res = await apiClient.getClient().patch(`/purchase-requests/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });
};

export const useDeletePurchaseRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/purchase-requests/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });
};
