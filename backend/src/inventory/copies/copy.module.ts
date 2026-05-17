import { Module } from '@nestjs/common';
import { CopyService } from './copy.service';
import { CopyController } from './copy.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [CopyController],
  providers: [CopyService, PrismaService, AuditService],
  exports: [CopyService],
})
export class CopyModule {}
