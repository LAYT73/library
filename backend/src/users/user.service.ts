import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, select: { id: true, email: true, fullName: true, role: true, department: true, isActive: true } }),
      this.prisma.user.count(),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: { email: string; password: string; fullName?: string; role?: any; department?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('User exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { email: dto.email, password: hashed, fullName: dto.fullName, role: dto.role, department: dto.department } });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
