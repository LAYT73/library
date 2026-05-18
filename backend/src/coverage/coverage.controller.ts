import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoverageService } from './coverage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { UpdateCoverageDto } from './dto/update-coverage.dto';

@ApiTags('coverage')
@Controller('coverage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoverageController {
  constructor(private service: CoverageService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Create coverage requirement' })
  create(@Body() dto: CreateCoverageDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  @ApiOperation({ summary: 'List coverage requirements' })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
    @Query('disciplineId') disciplineId?: string,
  ) {
    const dId = disciplineId ? Number(disciplineId) : undefined;
    return this.service.findAll(skip, take, dId);
  }

  @Get('discipline/:id')
  @ApiOperation({ summary: 'Get coverage for discipline' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  getByDiscipline(@Param('id', ParseIntPipe) id: number) {
    return this.service.coverageByDiscipline(id);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get coverage report' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  getReport(@Request() req: { user: { role: UserRole; department?: string } }) {
    return this.service.getCoverageReport(req.user);
  }

  @Get('knowledge-areas')
  @ApiOperation({ summary: 'Get coverage aggregated by knowledge area' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  getByKnowledgeArea(@Query('disciplineId') disciplineId?: string) {
    const dId = disciplineId ? Number(disciplineId) : undefined;
    return this.service.coverageByKnowledgeArea(dId);
  }

  @Get('reader-needs')
  @ApiOperation({ summary: 'Analyze fund compliance with reader needs' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  getReaderNeeds(
    @Request() req: { user: { role: UserRole; department?: string } },
  ) {
    return this.service.getReaderNeedsReport(req.user);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  @ApiOperation({ summary: 'Get coverage requirement by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Update coverage requirement' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoverageDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Delete coverage requirement' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
