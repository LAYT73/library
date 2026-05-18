import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { DisciplineListQueryDto } from '../common/dto/list-queries.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplineService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateDisciplineDto) {
    const created = await this.prisma.discipline.create({ data: dto });
    await this.cache.invalidatePrefix('disciplines:list');
    return created;
  }

  async findAll(query: DisciplineListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'disciplines', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const deptSearch = searchContains(query.department);
      const where: Prisma.DisciplineWhereInput = {
        ...(deptSearch ? { department: deptSearch } : {}),
        ...(search
          ? {
              OR: [{ name: search }, { department: search }],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.discipline.findMany({ skip, take, where, orderBy: { name: 'asc' } }),
        this.prisma.discipline.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const discipline = await this.prisma.discipline.findUnique({
      where: { id },
    });
    if (!discipline) throw new NotFoundException('Discipline not found');
    return discipline;
  }

  async update(id: number, dto: UpdateDisciplineDto) {
    await this.findOne(id);
    const updated = await this.prisma.discipline.update({ where: { id }, data: dto });
    await this.cache.invalidatePrefix('disciplines:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.discipline.delete({ where: { id } });
    await this.cache.invalidatePrefix('disciplines:list');
    return deleted;
  }
}
