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

  async getCoverageReport(user: any) {
    let disciplines;

    if (user.role === 'DEPARTMENT_HEAD') {
      // Department heads only see their own department's disciplines
      disciplines = await this.prisma.discipline.findMany({
        where: { department: user.department },
      });
    } else if (user.role === 'VIEWER') {
      // Viewers see all disciplines but limited data
      disciplines = await this.prisma.discipline.findMany();
    } else {
      // Admin and Librarian see all disciplines
      disciplines = await this.prisma.discipline.findMany();
    }

    const report: Array<{
      disciplineId: number;
      discipline: string;
      department: string;
      totalRequired: number;
      totalAvailable: number;
      coveragePercent: number;
    }> = [];

    for (const discipline of disciplines) {
      const coverages = await this.prisma.coverage.findMany({
        where: { disciplineId: discipline.id },
        include: { book: true },
      });

      let totalRequired = 0;
      let totalAvailable = 0;

      for (const cov of coverages) {
        const available = await this.prisma.copy.count({
          where: { bookId: cov.bookId, status: 'AVAILABLE' },
        });
        totalRequired += cov.requiredCount;
        totalAvailable += available;
      }

      const coveragePercent = totalRequired === 0 ? 100 : (totalAvailable / totalRequired) * 100;

      report.push({
        disciplineId: discipline.id,
        discipline: discipline.name,
        department: discipline.department,
        totalRequired,
        totalAvailable,
        coveragePercent: Number(coveragePercent.toFixed(2)),
      });
    }

    return report;
  }
}
