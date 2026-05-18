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
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateAuthorDto) {
    const created = await this.prisma.author.create({ data: { fullName: dto.fullName } });
    await this.cache.invalidatePrefix('authors:list');
    return created;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'authors', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.AuthorWhereInput = search ? { fullName: search } : {};
      const [data, total] = await Promise.all([
        this.prisma.author.findMany({ skip, take, where, orderBy: { fullName: 'asc' } }),
        this.prisma.author.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto) {
    await this.findOne(id);
    const updated = await this.prisma.author.update({
      where: { id },
      data: { fullName: dto.fullName },
    });
    await this.cache.invalidatePrefix('authors:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.author.delete({ where: { id } });
    await this.cache.invalidatePrefix('authors:list');
    return deleted;
  }
}
