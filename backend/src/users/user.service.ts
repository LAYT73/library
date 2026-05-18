import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { UserListQueryDto } from '../common/dto/list-queries.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async findAll(query: UserListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'users', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.UserWhereInput = {
        ...(query.role ? { role: query.role } : {}),
        ...(search
          ? {
              OR: [
                { email: search },
                { fullName: search },
                { department: search },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take,
          where,
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            department: true,
            isActive: true,
          },
          orderBy: { email: 'asc' },
        }),
        this.prisma.user.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: {
    email: string;
    password: string;
    fullName?: string;
    role?: Prisma.UserCreateInput['role'];
    department?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('User exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        fullName: dto.fullName,
        role: dto.role,
        department: dto.department,
      },
    });
    await this.cache.invalidatePrefix('users:list');
    return created;
  }

  async update(id: string, dto: Prisma.UserUpdateInput) {
    await this.findOne(id);
    const data = { ...dto };
    if (typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updated = await this.prisma.user.update({ where: { id }, data });
    await this.cache.invalidatePrefix('users:list');
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.user.delete({ where: { id } });
    await this.cache.invalidatePrefix('users:list');
    return deleted;
  }
}
