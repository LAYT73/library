import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class DisciplineAssignmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 25, disciplineId?: number) {
    const where = disciplineId ? { disciplineId } : {};
    const [data, total] = await Promise.all([
      this.prisma.disciplineAssignment.findMany({
        skip,
        take,
        where,
        include: { studentGroup: true, discipline: true },
        orderBy: { id: 'asc' },
      }),
      this.prisma.disciplineAssignment.count({ where }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async create(dto: CreateAssignmentDto) {
    const existing = await this.prisma.disciplineAssignment.findUnique({
      where: {
        studentGroupId_disciplineId: {
          studentGroupId: dto.studentGroupId,
          disciplineId: dto.disciplineId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Assignment already exists');
    }
    return this.prisma.disciplineAssignment.create({
      data: dto,
      include: { studentGroup: true, discipline: true },
    });
  }

  async remove(id: number) {
    const assignment = await this.prisma.disciplineAssignment.findUnique({
      where: { id },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.disciplineAssignment.delete({ where: { id } });
  }
}
