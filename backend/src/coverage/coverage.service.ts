import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CoverageService {
  constructor(private prisma: PrismaService) {}

  async coverageByDiscipline(disciplineId: number) {
    const discipline = await this.prisma.discipline.findUnique({ where: { id: disciplineId } });
    if (!discipline) throw new NotFoundException('Discipline not found');

    const coverages = await this.prisma.coverage.findMany({ where: { disciplineId }, include: { book: true } });

    const result: Array<any> = [];
    for (const cov of coverages) {
      const available = await this.prisma.copy.count({ where: { bookId: cov.bookId, status: 'AVAILABLE' } });
      const percent = cov.requiredCount === 0 ? 100 : (available / cov.requiredCount) * 100;
      result.push({ discipline: discipline.name, bookId: cov.bookId, required: cov.requiredCount, available, coveragePercent: Number(percent.toFixed(2)) });
    }

    return result;
  }
}
