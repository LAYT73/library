import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { OrderListQueryDto } from '../../common/dto/list-queries.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../../common/utils/pagination.util';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  async createFromRequest(prId: number, dto: CreateOrderFromRequestDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({
        where: { id: prId },
        include: { items: true },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');

      const created = await tx.order.create({
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
            orderId: created.id,
            bookId: item.bookId,
            quantity: item.quantity,
          },
        });
      }
      return created;
    });
    await this.audit.log({
      action: 'create',
      entity: 'Order',
      entityId: order.id,
      changes: { purchaseRequestId: prId },
    });
    await this.cache.invalidatePrefix('orders:list');
    return order;
  }

  async findAll(query: OrderListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'orders', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.OrderWhereInput = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.supplierId ? { supplierId: query.supplierId } : {}),
        ...(search ? { supplier: { name: search } } : {}),
      };
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          skip,
          take,
          where,
          orderBy: { orderDate: 'desc' },
          include: { supplier: true, purchaseRequest: true, items: true },
        }),
        this.prisma.order.count({ where }),
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

      return toPaginatedResult(data, total, skip, take);
    });
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
    await this.cache.invalidatePrefix('orders:list');
    return updated;
  }

  async remove(id: number) {
    const deleted = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      return tx.order.delete({ where: { id } });
    });
    await this.audit.log({ action: 'delete', entity: 'Order', entityId: id });
    await this.cache.invalidatePrefix('orders:list');
    return deleted;
  }
}
