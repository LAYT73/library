import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';

export interface AcquisitionItem {
  id: number;
  date: string;
  totalCost: string;
  supplierId: number;
  orderId?: number | null;
}

export interface PaginatedAcquisitionResponse {
  data: AcquisitionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const useAcquisitions = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['acquisitions', skip, take],
    queryFn: async () => {
      const response = await apiClient.getClient().get<PaginatedAcquisitionResponse>('/acquisitions', {
        params: { skip, take },
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

