import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [PrismaService],
})
export class DisciplineModule {}
