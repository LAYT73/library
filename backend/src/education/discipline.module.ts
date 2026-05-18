import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DisciplineService } from './discipline.service';
import { DisciplineController } from './discipline.controller';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { DisciplineAssignmentService } from './discipline-assignment.service';
import { DisciplineAssignmentController } from './discipline-assignment.controller';

@Module({
  controllers: [
    DisciplineController,
    StudentGroupController,
    DisciplineAssignmentController,
  ],
  providers: [
    PrismaService,
    DisciplineService,
    StudentGroupService,
    DisciplineAssignmentService,
  ],
  exports: [
    DisciplineService,
    StudentGroupService,
    DisciplineAssignmentService,
  ],
})
export class EducationModule {}
