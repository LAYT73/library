import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';

export const useCreateAcquisitionFromOrder = () => {
  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiClient.getClient().post(`/acquisitions/from-order/${orderId}`);
      return res.data;
    },
  });
};
