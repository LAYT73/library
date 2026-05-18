import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoverageService } from './coverage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('coverage')
@Controller('coverage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoverageController {
  constructor(private service: CoverageService) {}

  @Get('discipline/:id')
  @ApiOperation({ summary: 'Get coverage for discipline' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  getByDiscipline(@Param('id') id: number) {
    return this.service.coverageByDiscipline(Number(id));
  }

  @Get('report')
  @ApiOperation({ summary: 'Get coverage report' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  getReport(@Request() req: any) {
    return this.service.getCoverageReport(req.user);
  }
}
