import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { PurchaseRequest } from '../../shared/types';

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

export const useCreatePurchaseRequest = () => {
  return useMutation({
    mutationFn: async (payload: { items: Array<{ bookId: number; quantity: number }> }) => {
      const res = await apiClient.getClient().post('/purchase-requests', payload);
      return res.data;
    },
  });
};
