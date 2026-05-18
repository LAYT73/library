import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CopyStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { CoverageListQueryDto } from '../common/dto/list-queries.dto';
import { cachedList } from '../common/utils/cached-list.util';
import {
  resolvePagination,
  searchContains,
  toPaginatedResult,
} from '../common/utils/pagination.util';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { UpdateCoverageDto } from './dto/update-coverage.dto';

type JwtUser = { role: UserRole; department?: string | null };

type CoverageRow = {
  discipline: string;
  bookId: number;
  bookTitle?: string;
  required: number;
  available: number;
  coveragePercent: number;
};

type CoverageReportRow = {
  disciplineId: number;
  discipline: string;
  department: string;
  totalRequired: number;
  totalAvailable: number;
  coveragePercent: number;
};

type KnowledgeAreaCoverageRow = {
  knowledgeAreaId: number;
  name: string;
  totalRequired: number;
  totalAvailable: number;
  coveragePercent: number;
};

type ReaderNeedsRow = {
  disciplineId: number;
  discipline: string;
  department: string;
  readerCount: number;
  totalAvailable: number;
  compliancePercent: number;
};

@Injectable()
export class CoverageService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async findAll(query: CoverageListQueryDto) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    return cachedList(this.cache, 'coverage', { ...query, skip, take }, async () => {
      const search = searchContains(query.search);
      const where: Prisma.CoverageWhereInput = {
        ...(query.disciplineId ? { disciplineId: query.disciplineId } : {}),
        ...(search
          ? {
              OR: [
                { book: { title: search } },
                { book: { isbn: search } },
                { discipline: { name: search } },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        this.prisma.coverage.findMany({
          skip,
          take,
          where,
          orderBy: { id: 'asc' },
          include: { book: true, discipline: true },
        }),
        this.prisma.coverage.count({ where }),
      ]);
      return toPaginatedResult(data, total, skip, take);
    });
  }

  async create(dto: CreateCoverageDto) {
    const existing = await this.prisma.coverage.findUnique({
      where: {
        bookId_disciplineId: {
          bookId: dto.bookId,
          disciplineId: dto.disciplineId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Coverage for this book and discipline already exists',
      );
    }
    const created = await this.prisma.coverage.create({
      data: dto,
      include: { book: true, discipline: true },
    });
    await this.cache.invalidatePrefix('coverage:list');
    return created;
  }

  async update(id: number, dto: UpdateCoverageDto) {
    await this.findOne(id);
    const updated = await this.prisma.coverage.update({
      where: { id },
      data: dto,
      include: { book: true, discipline: true },
    });
    await this.cache.invalidatePrefix('coverage:list');
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.coverage.delete({ where: { id } });
    await this.cache.invalidatePrefix('coverage:list');
    return deleted;
  }

  async findOne(id: number) {
    const coverage = await this.prisma.coverage.findUnique({
      where: { id },
      include: { book: true, discipline: true },
    });
    if (!coverage) throw new NotFoundException('Coverage not found');
    return coverage;
  }

  async coverageByDiscipline(disciplineId: number): Promise<CoverageRow[]> {
    const discipline = await this.prisma.discipline.findUnique({
      where: { id: disciplineId },
    });
    if (!discipline) throw new NotFoundException('Discipline not found');

    const coverages = await this.prisma.coverage.findMany({
      where: { disciplineId },
      include: { book: true },
    });

    const result: CoverageRow[] = [];
    for (const cov of coverages) {
      const available = await this.prisma.copy.count({
        where: { bookId: cov.bookId, status: CopyStatus.AVAILABLE },
      });
      const percent =
        cov.requiredCount === 0 ? 100 : (available / cov.requiredCount) * 100;
      result.push({
        discipline: discipline.name,
        bookId: cov.bookId,
        bookTitle: cov.book.title,
        required: cov.requiredCount,
        available,
        coveragePercent: Number(percent.toFixed(2)),
      });
    }

    return result;
  }

  async getCoverageReport(user: JwtUser): Promise<CoverageReportRow[]> {
    const disciplines =
      user.role === UserRole.DEPARTMENT_HEAD
        ? await this.prisma.discipline.findMany({
            where: { department: user.department ?? '' },
          })
        : await this.prisma.discipline.findMany();

    const report: CoverageReportRow[] = [];

    for (const discipline of disciplines) {
      const coverages = await this.prisma.coverage.findMany({
        where: { disciplineId: discipline.id },
      });

      let totalRequired = 0;
      let totalAvailable = 0;

      for (const cov of coverages) {
        const available = await this.prisma.copy.count({
          where: { bookId: cov.bookId, status: CopyStatus.AVAILABLE },
        });
        totalRequired += cov.requiredCount;
        totalAvailable += available;
      }

      const coveragePercent =
        totalRequired === 0 ? 100 : (totalAvailable / totalRequired) * 100;

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

  async coverageByKnowledgeArea(
    disciplineId?: number,
  ): Promise<KnowledgeAreaCoverageRow[]> {
    const areas = await this.prisma.knowledgeArea.findMany();
    const result: KnowledgeAreaCoverageRow[] = [];

    for (const area of areas) {
      const kb = await this.prisma.knowledgeAreaBook.findMany({
        where: { knowledgeAreaId: area.id },
        select: { bookId: true },
      });
      const bookIds = kb.map((k) => k.bookId);

      if (bookIds.length === 0) {
        result.push({
          knowledgeAreaId: area.id,
          name: area.name,
          totalRequired: 0,
          totalAvailable: 0,
          coveragePercent: 100,
        });
        continue;
      }

      const coverages = await this.prisma.coverage.findMany({
        where: {
          bookId: { in: bookIds },
          ...(disciplineId ? { disciplineId } : {}),
        },
      });

      let totalRequired = 0;
      let totalAvailable = 0;

      for (const cov of coverages) {
        const available = await this.prisma.copy.count({
          where: { bookId: cov.bookId, status: CopyStatus.AVAILABLE },
        });
        totalRequired += cov.requiredCount;
        totalAvailable += available;
      }

      const coveragePercent =
        totalRequired === 0 ? 100 : (totalAvailable / totalRequired) * 100;

      result.push({
        knowledgeAreaId: area.id,
        name: area.name,
        totalRequired,
        totalAvailable,
        coveragePercent: Number(coveragePercent.toFixed(2)),
      });
    }

    return result;
  }

  async getReaderNeedsReport(user: JwtUser): Promise<ReaderNeedsRow[]> {
    const disciplines =
      user.role === UserRole.DEPARTMENT_HEAD
        ? await this.prisma.discipline.findMany({
            where: { department: user.department ?? '' },
          })
        : await this.prisma.discipline.findMany();

    const report: ReaderNeedsRow[] = [];

    for (const discipline of disciplines) {
      const assignments = await this.prisma.disciplineAssignment.findMany({
        where: { disciplineId: discipline.id },
        include: { studentGroup: true },
      });

      const readerCount = assignments.reduce(
        (sum, a) => sum + a.studentGroup.studentCount,
        0,
      );

      const coverages = await this.prisma.coverage.findMany({
        where: { disciplineId: discipline.id },
      });
      let totalAvailable = 0;
      for (const cov of coverages) {
        totalAvailable += await this.prisma.copy.count({
          where: { bookId: cov.bookId, status: CopyStatus.AVAILABLE },
        });
      }

      const compliancePercent =
        readerCount === 0
          ? 100
          : Number(((totalAvailable / readerCount) * 100).toFixed(2));

      report.push({
        disciplineId: discipline.id,
        discipline: discipline.name,
        department: discipline.department,
        readerCount,
        totalAvailable,
        compliancePercent,
      });
    }

    return report;
  }
}
