import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CopyStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { CopyListQueryDto } from '../../common/dto/list-queries.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../../common/utils/pagination.util';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';

@Injectable()
export class CopyService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  private async nextInventoryNumber() {
    const max = await this.prisma.copy.aggregate({
      _max: { inventoryNumber: true },
    });
    return (max._max.inventoryNumber ?? 1000) + 1;
  }

  async create(dto: CreateCopyDto) {
    const inventoryNumber =
      dto.inventoryNumber ?? (await this.nextInventoryNumber());
    try {
      const created = await this.prisma.copy.create({
        data: {
          inventoryNumber,
          status: CopyStatus.AVAILABLE,
          bookId: dto.bookId,
          acquisitionId: dto.acquisitionId,
        },
      });
      await this.audit.log({
        action: 'create',
        entity: 'Copy',
        entityId: created.id,
      });
      await this.cache.invalidatePrefix('copies:list');
      return created;
    } catch (e) {
      // if unique constraint on inventoryNumber fails, Prisma will throw; return meaningful message
      throw new BadRequestException('Failed to create copy');
    }
  }

  async findAll(query: CopyListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'copies', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const invNum = query.search?.trim() ? Number(query.search.trim()) : NaN;
      const where: Prisma.CopyWhereInput = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.bookId ? { bookId: query.bookId } : {}),
        ...(search
          ? {
              OR: [
                ...(!Number.isNaN(invNum)
                  ? [{ inventoryNumber: invNum }]
                  : []),
                { book: { title: search } },
                { book: { isbn: search } },
                { book: { author: { fullName: search } } },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.copy.findMany({
          skip,
          take,
          where,
          include: {
            book: { include: { author: true } },
            acquisition: { include: { supplier: true } },
          },
          orderBy: { inventoryNumber: 'asc' },
        }),
        this.prisma.copy.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.copy.findUnique({
      where: { id },
      include: {
        book: { include: { author: true } },
        acquisition: { include: { supplier: true } },
      },
    });
    if (!item) throw new NotFoundException('Copy not found');
    return item;
  }

  async update(id: number, dto: UpdateCopyDto) {
    await this.findOne(id);
    const updated = await this.prisma.copy.update({ where: { id }, data: { ...dto } });
    await this.cache.invalidatePrefix('copies:list');
    return updated;
  }

  async changeStatus(id: number, status: CopyStatus) {
    await this.findOne(id);
    const updated = await this.prisma.copy.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({
      action: 'update_status',
      entity: 'Copy',
      entityId: updated.id,
      changes: { status },
    });
    await this.cache.invalidatePrefix('copies:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.copy.delete({ where: { id } });
    await this.audit.log({ action: 'delete', entity: 'Copy', entityId: id });
    await this.cache.invalidatePrefix('copies:list');
    return deleted;
  }
}
