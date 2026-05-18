import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { AppCacheService } from '../../common/cache/app-cache.service';
import { BookListQueryDto } from '../../common/dto/list-queries.dto';
import { cachedList } from '../../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../../common/utils/pagination.util';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private cache: AppCacheService,
  ) {}

  async create(dto: CreateBookDto, userId?: string) {
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

      if (dto.knowledgeAreaIds && dto.knowledgeAreaIds.length > 0) {
        await this.prisma.knowledgeAreaBook.createMany({
          data: dto.knowledgeAreaIds.map((knowledgeAreaId) => ({
            knowledgeAreaId,
            bookId: book.id,
          })),
          skipDuplicates: true,
        });
      }

      await this.audit.log({
        userId,
        action: 'create',
        entity: 'Book',
        entityId: book.id,
      });

      await this.cache.invalidatePrefix('books:list');
      return this.findOne(book.id);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Книга с таким ISBN уже существует');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException('Указанный автор не найден');
        }
      }
      throw new BadRequestException('Не удалось создать книгу');
    }
  }

  async findAll(query: BookListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'books', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.BookWhereInput = {
        ...(query.authorId ? { authorId: query.authorId } : {}),
        ...(query.year ? { year: query.year } : {}),
        ...(search
          ? {
              OR: [
                { title: search },
                { isbn: search },
                { publisher: search },
                { author: { fullName: search } },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.book.findMany({
          skip,
          take,
          where,
          include: { author: true },
          orderBy: { title: 'asc' },
        }),
        this.prisma.book.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        knowledgeAreas: { include: { knowledgeArea: true } },
      },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: number, dto: UpdateBookDto, userId?: string) {
    await this.findOne(id);

    const { knowledgeAreaIds, ...bookFields } = dto;

    const updated = await this.prisma.book.update({
      where: { id },
      data: bookFields,
      include: { author: true },
    });

    if (knowledgeAreaIds !== undefined) {
      await this.prisma.knowledgeAreaBook.deleteMany({ where: { bookId: id } });
      if (knowledgeAreaIds.length > 0) {
        await this.prisma.knowledgeAreaBook.createMany({
          data: knowledgeAreaIds.map((knowledgeAreaId) => ({
            knowledgeAreaId,
            bookId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    await this.audit.log({
      userId,
      action: 'update',
      entity: 'Book',
      entityId: updated.id,
      changes: dto,
    });

    await this.cache.invalidatePrefix('books:list');
    return this.findOne(id);
  }

  async remove(id: number, userId?: string) {
    await this.findOne(id);
    const deleted = await this.prisma.book.delete({ where: { id } });
    await this.audit.log({
      userId,
      action: 'delete',
      entity: 'Book',
      entityId: id,
    });
    await this.cache.invalidatePrefix('books:list');
    return deleted;
  }
}
