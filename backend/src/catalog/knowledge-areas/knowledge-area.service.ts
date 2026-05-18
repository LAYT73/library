import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateKnowledgeAreaDto } from './dto/create-knowledge-area.dto';
import { UpdateKnowledgeAreaDto } from './dto/update-knowledge-area.dto';

@Injectable()
export class KnowledgeAreaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateKnowledgeAreaDto) {
    return this.prisma.knowledgeArea.create({ data: { name: dto.name } });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.knowledgeArea.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.knowledgeArea.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const item = await this.prisma.knowledgeArea.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('KnowledgeArea not found');
    return item;
  }

  async update(id: number, dto: UpdateKnowledgeAreaDto) {
    await this.findOne(id);
    return this.prisma.knowledgeArea.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.knowledgeArea.delete({ where: { id } });
  }
}
