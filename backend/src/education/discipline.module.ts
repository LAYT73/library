import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DisciplineService } from './discipline.service';
import { DisciplineController } from './discipline.controller';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';

@Module({
  controllers: [DisciplineController, StudentGroupController],
  providers: [PrismaService, DisciplineService, StudentGroupService],
  exports: [DisciplineService, StudentGroupService],
})
export class EducationModule {}

