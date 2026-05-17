import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [BookController],
  providers: [BookService, PrismaService, AuditService],
  exports: [BookService],
})
export class BookModule {}
