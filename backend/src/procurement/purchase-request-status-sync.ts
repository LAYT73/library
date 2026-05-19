import {
  OrderStatus,
  Prisma,
  PurchaseRequestStatus,
} from '@prisma/client';

/** Статус заявки по статусу привязанного заказа. */
export function purchaseRequestStatusForOrderStatus(
  orderStatus: OrderStatus,
): PurchaseRequestStatus {
  switch (orderStatus) {
    case OrderStatus.DELIVERED:
      return PurchaseRequestStatus.COMPLETED;
    case OrderStatus.CANCELLED:
      return PurchaseRequestStatus.APPROVED;
    case OrderStatus.CREATED:
    case OrderStatus.SENT:
    default:
      return PurchaseRequestStatus.APPROVED;
  }
}

/** Обновляет статус заявки по связанному заказу (если заказа нет — сбрасывает с COMPLETED на APPROVED). */
export async function syncPurchaseRequestStatusFromOrder(
  tx: Prisma.TransactionClient,
  purchaseRequestId: number | null | undefined,
): Promise<void> {
  if (purchaseRequestId == null) return;

  const pr = await tx.purchaseRequest.findUnique({
    where: { id: purchaseRequestId },
  });
  if (!pr || pr.status === PurchaseRequestStatus.REJECTED) return;

  const order = await tx.order.findFirst({
    where: { purchaseRequestId },
    orderBy: { id: 'desc' },
  });

  if (!order) {
    if (pr.status === PurchaseRequestStatus.COMPLETED) {
      await tx.purchaseRequest.update({
        where: { id: purchaseRequestId },
        data: { status: PurchaseRequestStatus.APPROVED },
      });
    }
    return;
  }

  const nextStatus = purchaseRequestStatusForOrderStatus(order.status);
  if (pr.status !== nextStatus) {
    await tx.purchaseRequest.update({
      where: { id: purchaseRequestId },
      data: { status: nextStatus },
    });
  }
}
