import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: CreateBookDto) {
    try {
      const book = await this.prisma.book.create({
        data: {
          isbn: dto.isbn,
          title: dto.title,
          publisher: dto.publisher,
          year: dto.year,
          authorId: dto.authorId,
        },
        include: { author: true },
      });

      // TODO: attach knowledge areas when provided
      await this.audit.log({ action: 'create', entity: 'Book', entityId: book.id });
      return book;
    } catch (e) {
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.book.findMany({ skip, take, include: { author: true } }),
      this.prisma.book.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { author: true } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    const updated = await this.prisma.book.update({ where: { id }, data: { ...dto } });
    await this.audit.log({ action: 'update', entity: 'Book', entityId: updated.id, changes: dto });
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.book.delete({ where: { id } });
    await this.audit.log({ action: 'delete', entity: 'Book', entityId: id });
    return deleted;
  }
}
