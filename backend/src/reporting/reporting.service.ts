import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  private async fetchFundRows() {
    const rows = await this.prisma.copy.findMany({ include: { book: true, acquisition: true } });
    return rows.map((r) => ({
      inventoryNumber: r.inventoryNumber,
      status: String(r.status),
      bookId: r.bookId,
      isbn: r.book?.isbn ?? '',
      title: r.book?.title ?? '',
      acquisitionId: r.acquisitionId ?? '',
    }));
  }

  async exportFund(format = 'csv') {
    const rows = await this.fetchFundRows();
    const header = ['inventoryNumber', 'status', 'bookId', 'isbn', 'title', 'acquisitionId'];

    if (format === 'csv') {
      const lines = rows.map((r) => [r.inventoryNumber, r.status, r.bookId, r.isbn, r.title.replace(/,/g, ' '), r.acquisitionId].join(','));
      return { data: [header.join(','), ...lines].join('\n'), mime: 'text/csv', filename: 'fund.csv' };
    }

    if (format === 'xlsx') {
      const aoa = [header, ...rows.map((r) => [r.inventoryNumber, r.status, r.bookId, r.isbn, r.title, r.acquisitionId])];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fund');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return { data: buf, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'fund.xlsx' };
    }

    // pdf
    const doc = new PDFDocument({ autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    const endPromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
    doc.fontSize(14).text('Fund Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(header.join(' | '));
    doc.moveDown();
    for (const r of rows) {
      doc.text([r.inventoryNumber, r.status, r.bookId, r.isbn, r.title, r.acquisitionId].join(' | '));
    }
    doc.end();
    const pdfBuf = await endPromise;
    return { data: pdfBuf, mime: 'application/pdf', filename: 'fund.pdf' };
  }

  async exportCoverage(disciplineId: number, format = 'csv') {
    const coverage = await this.prisma.coverage.findMany({ where: { disciplineId }, include: { book: true, discipline: true } });
    const header = ['discipline', 'bookId', 'title', 'required', 'available', 'coveragePercent'];
    const rows = await Promise.all(coverage.map(async (c) => {
      const available = await this.prisma.copy.count({ where: { bookId: c.bookId, status: { not: 'WRITTEN_OFF' } } });
      const percent = c.requiredCount ? (available / c.requiredCount) * 100 : 0;
      return { discipline: c.discipline?.name ?? '', bookId: c.bookId, title: c.book?.title ?? '', required: c.requiredCount, available, coveragePercent: percent.toFixed(2) };
    }));

    if (format === 'csv') {
      const lines = rows.map((r) => [r.discipline, r.bookId, r.title.replace(/,/g, ' '), r.required, r.available, r.coveragePercent].join(','));
      return { data: [header.join(','), ...lines].join('\n'), mime: 'text/csv', filename: `coverage_${disciplineId}.csv` };
    }

    if (format === 'xlsx') {
      const aoa = [header, ...rows.map((r) => [r.discipline, r.bookId, r.title, r.required, r.available, r.coveragePercent])];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Coverage');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return { data: buf, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `coverage_${disciplineId}.xlsx` };
    }

    // pdf
    const doc = new PDFDocument({ autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    const endPromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
    doc.fontSize(14).text('Coverage Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(header.join(' | '));
    doc.moveDown();
    for (const r of rows) {
      doc.text([r.discipline, r.bookId, r.title, r.required, r.available, r.coveragePercent].join(' | '));
    }
    doc.end();
    const pdfBuf = await endPromise;
    return { data: pdfBuf, mime: 'application/pdf', filename: `coverage_${disciplineId}.pdf` };
  }

  async importFundCsv(csv: string) {
    if (!csv) throw new BadRequestException('Empty CSV');
    const lines = csv.split(/\r?\n/).filter(Boolean);
    lines.shift();
    const items = lines.map((l) => {
      const cols = l.split(',');
      const inventoryNumber = Number(cols[0]);
      const status = cols[1];
      const bookId = Number(cols[2]) || null;
      const acquisitionId = cols[5] ? Number(cols[5]) : null;
      return { inventoryNumber, status, bookId, acquisitionId };
    });
    for (const it of items) {
      if (!it.bookId) continue;
      await this.prisma.copy.create({ data: { inventoryNumber: it.inventoryNumber, status: it.status as any, bookId: it.bookId, acquisitionId: it.acquisitionId } });
    }
    return { imported: items.length };
  }
}
