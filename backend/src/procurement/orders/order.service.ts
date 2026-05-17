import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async createFromRequest(prId: number, dto: CreateOrderFromRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({ where: { id: prId }, include: { items: true } });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');

      const order = await tx.order.create({ data: { supplierId: dto.supplierId, purchaseRequestId: pr.id } });

      for (const item of pr.items) {
        await tx.orderItem.create({ data: { orderId: order.id, bookId: item.bookId, quantity: item.quantity } });
      }

      await this.audit.log({ action: 'create', entity: 'Order', entityId: order.id, changes: { purchaseRequestId: pr.id } });
      return order;
    });
  }
}
