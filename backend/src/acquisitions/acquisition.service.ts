import { Injectable, NotFoundException } from '@nestjs/common';
import { CopyStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { AcquisitionListQueryDto } from '../common/dto/list-queries.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import { UpdateAcquisitionDto } from './dto/update-acquisition.dto';

@Injectable()
export class AcquisitionService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  async createFromOrder(orderId: number, totalCost: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');

      const acquisition = await tx.acquisition.create({
        data: {
          supplierId: order.supplierId,
          orderId: order.id,
          totalCost,
        },
      });

      // create copies for each order item
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          // generate inventory number
          const max = await tx.copy.aggregate({
            _max: { inventoryNumber: true },
          });
          const inventoryNumber = (max._max.inventoryNumber ?? 1000) + 1;
          await tx.copy.create({
            data: {
              inventoryNumber,
              status: CopyStatus.AVAILABLE,
              bookId: item.bookId,
              acquisitionId: acquisition.id,
            },
          });
        }
      }

      await this.audit.log({
        action: 'create',
        entity: 'Acquisition',
        entityId: acquisition.id,
        changes: { orderId: order.id, totalCost },
      });
      await this.cache.invalidatePrefix('acquisitions:list');
      return acquisition;
    });
  }

  async findAll(query: AcquisitionListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'acquisitions', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.AcquisitionWhereInput = {
        ...(query.supplierId ? { supplierId: query.supplierId } : {}),
        ...(search ? { supplier: { name: search } } : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.acquisition.findMany({
          skip,
          take,
          where,
          orderBy: { date: 'desc' },
          include: {
            supplier: true,
            order: true,
            copies: { include: { book: { include: { author: true } } } },
          },
        }),
        this.prisma.acquisition.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const acquisition = await this.prisma.acquisition.findUnique({
      where: { id },
      include: { supplier: true, order: true, copies: true },
    });
    if (!acquisition) throw new NotFoundException('Acquisition not found');
    return acquisition;
  }

  async update(id: number, dto: UpdateAcquisitionDto) {
    await this.findOne(id);
    const updated = await this.prisma.acquisition.update({
      where: { id },
      data: {
        totalCost: dto.totalCost,
        supplierId: dto.supplierId,
        orderId: dto.orderId ?? undefined,
      },
    });
    await this.audit.log({
      action: 'update',
      entity: 'Acquisition',
      entityId: id,
      changes: dto,
    });
    await this.cache.invalidatePrefix('acquisitions:list');
    return updated;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const acquisition = await tx.acquisition.findUnique({
        where: { id },
        include: { copies: true },
      });
      if (!acquisition) throw new NotFoundException('Acquisition not found');
      await tx.copy.updateMany({
        where: { acquisitionId: id },
        data: { acquisitionId: null },
      });
      const deleted = await tx.acquisition.delete({ where: { id } });
      await this.audit.log({
        action: 'delete',
        entity: 'Acquisition',
        entityId: id,
      });
      await this.cache.invalidatePrefix('acquisitions:list');
      return deleted;
    });
  }
}
