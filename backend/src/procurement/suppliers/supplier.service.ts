import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../../common/utils/pagination.util';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateSupplierDto) {
    const created = await this.prisma.supplier.create({
      data: { name: dto.name, contactInfo: dto.contactInfo },
    });
    await this.audit.log({
      action: 'create',
      entity: 'Supplier',
      entityId: created.id,
    });
    await this.cache.invalidatePrefix('suppliers:list');
    return created;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'suppliers', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.SupplierWhereInput = search
        ? { OR: [{ name: search }, { contactInfo: search }] }
        : {};
      const [data, total] = await Promise.all([
        this.prisma.supplier.findMany({ skip, take, where, orderBy: { name: 'asc' } }),
        this.prisma.supplier.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const s = await this.prisma.supplier.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async update(id: number, dto: Partial<CreateSupplierDto>) {
    await this.findOne(id);
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      action: 'update',
      entity: 'Supplier',
      entityId: updated.id,
      changes: dto,
    });
    await this.cache.invalidatePrefix('suppliers:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.supplier.delete({ where: { id } });
    await this.audit.log({
      action: 'delete',
      entity: 'Supplier',
      entityId: id,
    });
    await this.cache.invalidatePrefix('suppliers:list');
    return deleted;
  }
}
