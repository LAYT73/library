import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createFromRequest(prId: number, dto: CreateOrderFromRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({
        where: { id: prId },
        include: { items: true },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');

      const order = await tx.order.create({
        data: {
          supplierId: dto.supplierId,
          purchaseRequestId: pr.id,
          expectedDate: dto.expectedDate
            ? new Date(dto.expectedDate)
            : undefined,
        },
      });

      for (const item of pr.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            bookId: item.bookId,
            quantity: item.quantity,
          },
        });
      }

      await this.audit.log({
        action: 'create',
        entity: 'Order',
        entityId: order.id,
        changes: { purchaseRequestId: pr.id },
      });
      return order;
    });
  }

  async findAll(skip = 0, take = 25) {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take,
        orderBy: { orderDate: 'desc' },
        include: { supplier: true, purchaseRequest: true, items: true },
      }),
      this.prisma.order.count(),
    ]);

    const now = new Date();
    const data = orders.map((order) => ({
      ...order,
      isOverdue:
        order.expectedDate != null &&
        order.status !== OrderStatus.DELIVERED &&
        order.status !== OrderStatus.CANCELLED &&
        order.expectedDate < now,
    }));

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { supplier: true, purchaseRequest: true, items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        supplierId: dto.supplierId,
        purchaseRequestId: dto.purchaseRequestId ?? undefined,
        expectedDate:
          dto.expectedDate === null
            ? null
            : dto.expectedDate
              ? new Date(dto.expectedDate)
              : undefined,
      },
    });
    await this.audit.log({
      action: 'update',
      entity: 'Order',
      entityId: id,
      changes: dto,
    });
    return updated;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      const deleted = await tx.order.delete({ where: { id } });
      await this.audit.log({ action: 'delete', entity: 'Order', entityId: id });
      return deleted;
    });
  }
}
