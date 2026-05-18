import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';

@Injectable()
export class StudentGroupService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateStudentGroupDto) {
    const created = await this.prisma.studentGroup.create({ data: dto });
    await this.cache.invalidatePrefix('student-groups:list');
    return created;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'student-groups', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.StudentGroupWhereInput = search ? { name: search } : {};
      const [data, total] = await Promise.all([
        this.prisma.studentGroup.findMany({ skip, take, where, orderBy: { name: 'asc' } }),
        this.prisma.studentGroup.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.studentGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Student group not found');
    return group;
  }

  async update(id: number, dto: UpdateStudentGroupDto) {
    await this.findOne(id);
    const updated = await this.prisma.studentGroup.update({ where: { id }, data: dto });
    await this.cache.invalidatePrefix('student-groups:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.studentGroup.delete({ where: { id } });
    await this.cache.invalidatePrefix('student-groups:list');
    return deleted;
  }
}
