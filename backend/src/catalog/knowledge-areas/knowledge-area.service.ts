import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../../common/utils/pagination.util';
import { CreateKnowledgeAreaDto } from './dto/create-knowledge-area.dto';
import { UpdateKnowledgeAreaDto } from './dto/update-knowledge-area.dto';

@Injectable()
export class KnowledgeAreaService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateKnowledgeAreaDto) {
    const created = await this.prisma.knowledgeArea.create({ data: { name: dto.name } });
    await this.cache.invalidatePrefix('knowledge-areas:list');
    return created;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'knowledge-areas', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.KnowledgeAreaWhereInput = search ? { name: search } : {};
      const [data, total] = await Promise.all([
        this.prisma.knowledgeArea.findMany({ skip, take, where, orderBy: { name: 'asc' } }),
        this.prisma.knowledgeArea.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.knowledgeArea.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('KnowledgeArea not found');
    return item;
  }

  async update(id: number, dto: UpdateKnowledgeAreaDto) {
    await this.findOne(id);
    const updated = await this.prisma.knowledgeArea.update({
      where: { id },
      data: { name: dto.name },
    });
    await this.cache.invalidatePrefix('knowledge-areas:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.knowledgeArea.delete({ where: { id } });
    await this.cache.invalidatePrefix('knowledge-areas:list');
    return deleted;
  }
}
