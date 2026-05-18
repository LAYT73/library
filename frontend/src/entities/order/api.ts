import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';

export interface OrderListItem {
  id: number;
  orderDate: string;
  expectedDate?: string | null;
  status: string;
  supplierId: number;
  purchaseRequestId?: number | null;
  isOverdue?: boolean;
  supplier?: { id: number; name: string };
  items: Array<{ id: number; quantity: number; bookId: number }>;
}

export interface PaginatedOrderResponse {
  data: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const useOrders = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['orders', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedOrderResponse>('/orders', { params: { skip, take } });
      return res.data;
    },
  });
};

export const useCreateOrderFromRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, supplierId, expectedDate }: { requestId: number; supplierId: number; expectedDate?: string }) => {
      const res = await apiClient.getClient().post(`/orders/from-request/${requestId}`, { supplierId, expectedDate });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useUpdateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { status?: string; supplierId?: number; purchaseRequestId?: number | null; expectedDate?: string | null } }) => {
      const res = await apiClient.getClient().patch(`/orders/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/orders/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};
