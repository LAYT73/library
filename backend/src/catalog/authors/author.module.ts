import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AuthorController],
  providers: [AuthorService, PrismaService],
  exports: [AuthorService],
})
export class AuthorModule {}
