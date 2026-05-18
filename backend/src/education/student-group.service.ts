import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';

@Injectable()
export class StudentGroupService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentGroupDto) {
    return this.prisma.studentGroup.create({ data: dto });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.studentGroup.findMany({ skip, take, orderBy: { name: 'asc' } }),
      this.prisma.studentGroup.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const group = await this.prisma.studentGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Student group not found');
    return group;
  }

  async update(id: number, dto: UpdateStudentGroupDto) {
    await this.findOne(id);
    return this.prisma.studentGroup.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.studentGroup.delete({ where: { id } });
  }
}
