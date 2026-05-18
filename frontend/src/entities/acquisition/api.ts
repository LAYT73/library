import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Book, Supplier } from '../../shared/types';

export interface AcquisitionCopy {
  id: number;
  inventoryNumber: number;
  book?: Book;
}

export interface AcquisitionItem {
  id: number;
  date: string;
  totalCost: string;
  supplierId: number;
  orderId?: number | null;
  supplier?: Supplier;
  order?: { id: number; status: string; orderDate?: string };
  copies?: AcquisitionCopy[];
}

export interface PaginatedAcquisitionResponse {
  data: AcquisitionItem[];
  total: number;
  page: number;
  pageSize: number;
}

import { buildListParams, type ListQueryParams } from '../../shared/types/list';

export const useAcquisitions = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['acquisitions', params],
    queryFn: async () => {
      const response = await apiClient.getClient().get<PaginatedAcquisitionResponse>('/acquisitions', {
        params: buildListParams(params),
      });
      return response.data;
    },
  });
};

export const useCreateAcquisitionFromOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiClient.getClient().post(`/acquisitions/from-order/${orderId}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acquisitions'] }),
  });
};

export const useUpdateAcquisition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<AcquisitionItem> }) => {
      const res = await apiClient.getClient().patch(`/acquisitions/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acquisitions'] }),
  });
};

export const useDeleteAcquisition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/acquisitions/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acquisitions'] }),
  });
};
