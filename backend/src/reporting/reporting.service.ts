import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { resolvePdfFontPath } from './pdf-fonts';

const COPY_STATUS_RU: Record<string, string> = {
  AVAILABLE: 'Доступен',
  ISSUED: 'Выдан',
  WRITTEN_OFF: 'Списан',
  LOST: 'Утерян',
};

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  private withCsvBom(content: string): string {
    return `\uFEFF${content}`;
  }

  private formatDateRu(value: Date | string | null | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatAcquisitionLabel(
    acquisition: { date: Date; supplier?: { name: string } | null } | null,
  ): string {
    if (!acquisition) return '—';
    const date = this.formatDateRu(acquisition.date);
    const supplier = acquisition.supplier?.name;
    return supplier ? `${date}, ${supplier}` : date;
  }

  private createPdfTable(
    title: string,
    headers: string[],
    rows: string[][],
    landscape = false,
  ): Promise<Buffer> {
    const fontPath = resolvePdfFontPath();
    const doc = new PDFDocument({
      margin: 36,
      size: 'A4',
      layout: landscape ? 'landscape' : 'portrait',
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const endPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const fontName = fontPath ? 'Cyrillic' : 'Helvetica';
    if (fontPath) {
      doc.registerFont('Cyrillic', fontPath);
    }

    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const marginTop = doc.page.margins.top;
    const marginBottom = doc.page.margins.bottom;
    const pageWidth = doc.page.width - marginLeft - marginRight;

    const colCount = headers.length;
    const colWidth = pageWidth / colCount;
    const headerHeight = 24;
    const minRowHeight = 18;
    const cellPadding = 6;
    const fontSize = 8;

    let y = marginTop;

    doc.font(fontName).fontSize(14).text(title, marginLeft, y, {
      width: pageWidth,
      align: 'center',
    });
    y += 28;

    const cellTextWidth = colWidth - cellPadding * 2;

    const measureHeight = (text: string) => {
      doc.font(fontName).fontSize(fontSize);
      return doc.heightOfString(text || '—', { width: cellTextWidth });
    };

    const drawHeader = () => {
      doc.font(fontName).fontSize(fontSize);
      doc.rect(marginLeft, y, pageWidth, headerHeight).fill('#e6e6e6');
      headers.forEach((header, i) => {
        doc.fillColor('#000000').text(header, marginLeft + i * colWidth + cellPadding, y + 7, {
          width: cellTextWidth,
          lineBreak: true,
        });
      });
      doc
        .strokeColor('#999999')
        .rect(marginLeft, y, pageWidth, headerHeight)
        .stroke();
      y += headerHeight;
    };

    const ensureSpace = (needed: number) => {
      if (y + needed > doc.page.height - marginBottom) {
        doc.addPage({ layout: landscape ? 'landscape' : 'portrait', margin: 36 });
        if (fontPath) doc.font(fontName);
        y = marginTop;
        drawHeader();
      }
    };

    drawHeader();

    for (const row of rows) {
      const heights = row.map((cell) => measureHeight(cell));
      const rowHeight = Math.max(minRowHeight, ...heights) + cellPadding * 2;

      ensureSpace(rowHeight);
      doc.font(fontName).fontSize(fontSize).fillColor('#000000');

      row.forEach((cell, i) => {
        const x = marginLeft + i * colWidth + cellPadding;
        doc.text(cell || '—', x, y + cellPadding, {
          width: cellTextWidth,
          lineBreak: true,
        });
        doc
          .strokeColor('#dddddd')
          .rect(marginLeft + i * colWidth, y, colWidth, rowHeight)
          .stroke();
      });

      y += rowHeight;
    }

    doc.end();
    return endPromise;
  }

  private async fetchFundRows() {
    const rows = await this.prisma.copy.findMany({
      include: {
        book: { include: { author: true } },
        acquisition: { include: { supplier: true } },
      },
      orderBy: { inventoryNumber: 'asc' },
    });
    return rows.map((r) => ({
      inventoryNumber: String(r.inventoryNumber),
      status: COPY_STATUS_RU[r.status] ?? r.status,
      title: r.book?.title ?? '—',
      isbn: r.book?.isbn ?? '—',
      author: r.book?.author?.fullName ?? '—',
      publisher: r.book?.publisher ?? '—',
      acquisition: this.formatAcquisitionLabel(r.acquisition),
    }));
  }

  async exportFund(format = 'csv') {
    const rows = await this.fetchFundRows();
    const header = [
      'Инв. номер',
      'Статус',
      'Название',
      'ISBN',
      'Автор',
      'Издательство',
      'Поступление',
    ];

    const dataRows = rows.map((r) => [
      r.inventoryNumber,
      r.status,
      r.title,
      r.isbn,
      r.author,
      r.publisher,
      r.acquisition,
    ]);

    if (format === 'csv') {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const lines = dataRows.map((r) => r.map(escape).join(','));
      return {
        data: this.withCsvBom([header.map(escape).join(','), ...lines].join('\n')),
        mime: 'text/csv; charset=utf-8',
        filename: 'fund.csv',
      };
    }

    if (format === 'xlsx') {
      const aoa = [header, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Фонд');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return {
        data: buf,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'fund.xlsx',
      };
    }

    const pdfBuf = await this.createPdfTable(
      'Отчёт по библиотечному фонду',
      header,
      dataRows,
      true,
    );
    return { data: pdfBuf, mime: 'application/pdf', filename: 'fund.pdf' };
  }

  async exportCoverage(disciplineId: number, format = 'csv') {
    const coverage = await this.prisma.coverage.findMany({
      where: { disciplineId },
      include: { book: { include: { author: true } }, discipline: true },
    });
    const header = [
      'Дисциплина',
      'Название',
      'Автор',
      'ISBN',
      'Требуется',
      'Доступно',
      'Обеспеченность %',
    ];
    const rows = await Promise.all(
      coverage.map(async (c) => {
        const available = await this.prisma.copy.count({
          where: { bookId: c.bookId, status: 'AVAILABLE' },
        });
        const percent = c.requiredCount ? (available / c.requiredCount) * 100 : 0;
        return {
          discipline: c.discipline?.name ?? '',
          title: c.book?.title ?? '—',
          author: c.book?.author?.fullName ?? '—',
          isbn: c.book?.isbn ?? '—',
          required: String(c.requiredCount),
          available: String(available),
          coveragePercent: percent.toFixed(2),
        };
      }),
    );

    const dataRows = rows.map((r) => [
      r.discipline,
      r.title,
      r.author,
      r.isbn,
      r.required,
      r.available,
      r.coveragePercent,
    ]);

    if (format === 'csv') {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const lines = dataRows.map((r) => r.map(escape).join(','));
      return {
        data: this.withCsvBom([header.map(escape).join(','), ...lines].join('\n')),
        mime: 'text/csv; charset=utf-8',
        filename: `coverage_${disciplineId}.csv`,
      };
    }

    if (format === 'xlsx') {
      const aoa = [header, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Обеспеченность');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return {
        data: buf,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `coverage_${disciplineId}.xlsx`,
      };
    }

    const pdfBuf = await this.createPdfTable(
      `Отчёт по обеспеченности: ${rows[0]?.discipline ?? disciplineId}`,
      header,
      dataRows,
      true,
    );
    return {
      data: pdfBuf,
      mime: 'application/pdf',
      filename: `coverage_${disciplineId}.pdf`,
    };
  }

  async importFundCsv(csv: string) {
    if (!csv) throw new BadRequestException('Empty CSV');
    const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    lines.shift();
    const items = lines.map((l) => {
      const cols = l.split(',').map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
      const inventoryNumber = Number(cols[0]);
      const statusRaw = cols[1]?.trim() ?? 'AVAILABLE';
      const statusEntry = Object.entries(COPY_STATUS_RU).find(([, label]) => label === statusRaw);
      const status = statusEntry?.[0] ?? statusRaw;
      const isbn = cols[3]?.trim();
      return { inventoryNumber, status, isbn };
    });

    let imported = 0;
    for (const it of items) {
      if (!it.isbn || !it.inventoryNumber) continue;
      const book = await this.prisma.book.findFirst({ where: { isbn: it.isbn } });
      if (!book) continue;
      await this.prisma.copy.create({
        data: {
          inventoryNumber: it.inventoryNumber,
          status: it.status as 'AVAILABLE',
          bookId: book.id,
        },
      });
      imported += 1;
    }
    return { imported };
  }
}
