import { PurchaseRequestStatus } from '@prisma/client';

/** Заявки, по которым ещё можно создать заказ (без существующего заказа). */
export const PURCHASE_REQUEST_STATUSES_FOR_ORDER: PurchaseRequestStatus[] = [
  PurchaseRequestStatus.CREATED,
  PurchaseRequestStatus.APPROVED,
];

export function isPurchaseRequestEligibleForOrder(
  status: PurchaseRequestStatus,
): boolean {
  return PURCHASE_REQUEST_STATUSES_FOR_ORDER.includes(status);
}
