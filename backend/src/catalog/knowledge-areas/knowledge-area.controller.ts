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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeAreaService } from './knowledge-area.service';
import { CreateKnowledgeAreaDto } from './dto/create-knowledge-area.dto';
import { UpdateKnowledgeAreaDto } from './dto/update-knowledge-area.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('knowledge-areas')
@Controller('knowledge-areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgeAreaController {
  constructor(private service: KnowledgeAreaService) {}

  @Post()
  @ApiOperation({ summary: 'Create knowledge area' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateKnowledgeAreaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List knowledge areas with pagination' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge area by id' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update knowledge area' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKnowledgeAreaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete knowledge area' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
