import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DisciplineAssignmentService } from './discipline-assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AssignmentListQueryDto } from '../common/dto/list-queries.dto';

@ApiTags('discipline-assignments')
@Controller('discipline-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisciplineAssignmentController {
  constructor(private service: DisciplineAssignmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Assign student group to discipline' })
  create(@Body() dto: CreateAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  @ApiOperation({ summary: 'List discipline assignments' })
  findAll(@Query() query: AssignmentListQueryDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Remove discipline assignment' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
