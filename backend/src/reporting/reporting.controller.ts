import {
  Controller,
  Get,
  Query,
  Res,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private svc: ReportingService) {}

  @Get('fund')
  @ApiOperation({ summary: 'Export fund report (csv|xlsx|pdf)' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  async fund(@Query('format') format: string, @Res() res: Response) {
    const fmt = (format || 'csv').toLowerCase();
    const out = await this.svc.exportFund(fmt);
    res.setHeader('Content-Type', out.mime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${out.filename}"`,
    );
    return res.send(out.data);
  }

  @Get('coverage/:disciplineId')
  @ApiOperation({ summary: 'Export coverage report for discipline' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  async coverage(
    @Param('disciplineId') disciplineId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const fmt = (format || 'csv').toLowerCase();
    const out = await this.svc.exportCoverage(Number(disciplineId), fmt);
    res.setHeader('Content-Type', out.mime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${out.filename}"`,
    );
    return res.send(out.data);
  }

  @Post('import/fund')
  @ApiOperation({ summary: 'Import fund CSV payload in body { csv: string }' })
  @Roles(UserRole.ADMIN)
  async importFund(@Body() body: { csv: string }) {
    return this.svc.importFundCsv(body.csv);
  }
}
