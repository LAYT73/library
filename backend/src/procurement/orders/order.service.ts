import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { isPurchaseRequestEligibleForOrder } from '../purchase-request-eligibility';
import { syncPurchaseRequestStatusFromOrder } from '../purchase-request-status-sync';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';
import { isExpectedDateBefore } from './order-date.util';
import { UpdateOrderDto } from './dto/update-order.dto';

const EXPECTED_DATE_BEFORE_ORDER_MSG =
  'Ожидаемая дата поставки не может быть раньше даты создания заказа';

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
        include: { items: true, _count: { select: { orders: true } } },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');
      if (!isPurchaseRequestEligibleForOrder(pr.status)) {
        throw new BadRequestException(
          'Заказ можно создать только по заявке со статусом «Создана» или «Одобрена»',
        );
      }
      if (pr._count.orders > 0) {
        throw new BadRequestException('По этой заявке заказ уже создан');
      }
      if (
        dto.expectedDate &&
        isExpectedDateBefore(dto.expectedDate, new Date())
      ) {
        throw new BadRequestException(EXPECTED_DATE_BEFORE_ORDER_MSG);
      }

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
      await syncPurchaseRequestStatusFromOrder(tx, pr.id);
      return created;
    });
    await this.audit.log({
      action: 'create',
      entity: 'Order',
      entityId: order.id,
      changes: { purchaseRequestId: prId },
    });
    await this.cache.invalidatePrefix('orders:list');
    await this.cache.invalidatePrefix('purchase-requests:list');
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
    const order = await this.findOne(id);
    if (
      dto.expectedDate != null &&
      dto.expectedDate !== '' &&
      isExpectedDateBefore(dto.expectedDate, order.orderDate)
    ) {
      throw new BadRequestException(EXPECTED_DATE_BEFORE_ORDER_MSG);
    }
    if (dto.purchaseRequestId != null) {
      const pr = await this.prisma.purchaseRequest.findUnique({
        where: { id: dto.purchaseRequestId },
        include: { _count: { select: { orders: true } } },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');
      if (!isPurchaseRequestEligibleForOrder(pr.status)) {
        throw new BadRequestException(
          'К заказу можно привязать только заявку со статусом «Создана» или «Одобрена»',
        );
      }
      const otherOrder = await this.prisma.order.findFirst({
        where: { purchaseRequestId: dto.purchaseRequestId, id: { not: id } },
      });
      if (otherOrder) {
        throw new BadRequestException('По этой заявке уже есть другой заказ');
      }
    }
    const previousRequestId = order.purchaseRequestId;
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
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
      if (
        previousRequestId != null &&
        previousRequestId !== result.purchaseRequestId
      ) {
        await syncPurchaseRequestStatusFromOrder(tx, previousRequestId);
      }
      await syncPurchaseRequestStatusFromOrder(tx, result.purchaseRequestId);
      return result;
    });
    await this.audit.log({
      action: 'update',
      entity: 'Order',
      entityId: id,
      changes: dto,
    });
    await this.cache.invalidatePrefix('orders:list');
    await this.cache.invalidatePrefix('purchase-requests:list');
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
      const removed = await tx.order.delete({ where: { id } });
      await syncPurchaseRequestStatusFromOrder(tx, order.purchaseRequestId);
      return removed;
    });
    await this.audit.log({ action: 'delete', entity: 'Order', entityId: id });
    await this.cache.invalidatePrefix('orders:list');
    await this.cache.invalidatePrefix('purchase-requests:list');
    return deleted;
  }
}
