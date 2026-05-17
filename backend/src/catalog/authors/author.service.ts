import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuthorDto) {
    return this.prisma.author.create({ data: { fullName: dto.fullName } });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.author.findMany({ skip, take, orderBy: { fullName: 'asc' } }),
      this.prisma.author.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto) {
    await this.findOne(id);
    return this.prisma.author.update({ where: { id }, data: { fullName: dto.fullName } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.author.delete({ where: { id } });
  }
}
