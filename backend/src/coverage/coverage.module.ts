import { Module } from '@nestjs/common';
import { CoverageService } from './coverage.service';
import { CoverageController } from './coverage.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [CoverageController],
  providers: [CoverageService, PrismaService],
})
export class CoverageModule {}
