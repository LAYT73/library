import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { AssignmentListQueryDto } from '../common/dto/list-queries.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class DisciplineAssignmentService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async findAll(query: AssignmentListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'assignments', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.DisciplineAssignmentWhereInput = {
        ...(query.disciplineId ? { disciplineId: query.disciplineId } : {}),
        ...(search
          ? {
              OR: [
                { discipline: { name: search } },
                { studentGroup: { name: search } },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.disciplineAssignment.findMany({
          skip,
          take,
          where,
          include: { studentGroup: true, discipline: true },
          orderBy: { id: 'asc' },
        }),
        this.prisma.disciplineAssignment.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async create(dto: CreateAssignmentDto) {
    const existing = await this.prisma.disciplineAssignment.findUnique({
      where: {
        studentGroupId_disciplineId: {
          studentGroupId: dto.studentGroupId,
          disciplineId: dto.disciplineId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Assignment already exists');
    }
    const created = await this.prisma.disciplineAssignment.create({
      data: dto,
      include: { studentGroup: true, discipline: true },
    });
    await this.cache.invalidatePrefix('assignments:list');
    return created;
  }

  async remove(id: number) {
    const assignment = await this.prisma.disciplineAssignment.findUnique({
      where: { id },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    const deleted = await this.prisma.disciplineAssignment.delete({ where: { id } });
    await this.cache.invalidatePrefix('assignments:list');
    return deleted;
  }
}
