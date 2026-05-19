import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PurchaseRequestStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { PurchaseRequestListQueryDto } from '../../common/dto/list-queries.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import { resolvePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { PURCHASE_REQUEST_STATUSES_FOR_ORDER } from '../purchase-request-eligibility';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { UpdatePurchaseRequestDto } from './dto/update-pr.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreatePurchaseRequestDto) {
    const pr = await this.prisma.$transaction(async (tx) => {
      const created = await tx.purchaseRequest.create({ data: {} });
      for (const item of dto.items) {
        await tx.purchaseRequestItem.create({
          data: {
            bookId: item.bookId,
            quantity: item.quantity,
            purchaseRequestId: created.id,
          },
        });
      }
      return created;
    });
    await this.audit.log({
      action: 'create',
      entity: 'PurchaseRequest',
      entityId: pr.id,
      changes: { items: dto.items },
    });
    await this.cache.invalidatePrefix('purchase-requests:list');
    return pr;
  }

  async findOne(id: number) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!pr) throw new NotFoundException('PurchaseRequest not found');
    return pr;
  }

  async findAll(query: PurchaseRequestListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'purchase-requests', { ...query, skip, take }, async () => {
      const where: Prisma.PurchaseRequestWhereInput = query.forOrderCreation
        ? {
            status: { in: PURCHASE_REQUEST_STATUSES_FOR_ORDER },
            orders: { none: {} },
          }
        : query.status
          ? { status: query.status }
          : {};
      const [data, total] = await Promise.all([
        this.prisma.purchaseRequest.findMany({
          skip,
          take,
          where,
          orderBy: { date: 'desc' },
          include: { items: true },
        }),
        this.prisma.purchaseRequest.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async update(id: number, dto: UpdatePurchaseRequestDto) {
    await this.findOne(id);
    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.audit.log({
      action: 'update',
      entity: 'PurchaseRequest',
      entityId: id,
      changes: dto,
    });
    await this.cache.invalidatePrefix('purchase-requests:list');
    return updated;
  }

  async remove(id: number) {
    const deleted = await this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');
      await tx.purchaseRequestItem.deleteMany({
        where: { purchaseRequestId: id },
      });
      return tx.purchaseRequest.delete({ where: { id } });
    });
    await this.audit.log({
      action: 'delete',
      entity: 'PurchaseRequest',
      entityId: id,
    });
    await this.cache.invalidatePrefix('purchase-requests:list');
    return deleted;
  }
}
