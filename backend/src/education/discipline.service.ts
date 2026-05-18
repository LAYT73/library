import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplineService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDisciplineDto) {
    return this.prisma.discipline.create({ data: dto });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.discipline.findMany({ skip, take, orderBy: { name: 'asc' } }),
      this.prisma.discipline.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
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
    return this.prisma.discipline.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.discipline.delete({ where: { id } });
  }
}
