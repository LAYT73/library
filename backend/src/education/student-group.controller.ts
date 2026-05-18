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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StudentGroupService } from './student-group.service';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('student-groups')
@Controller('student-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentGroupController {
  constructor(private service: StudentGroupService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Create student group' })
  create(@Body() dto: CreateStudentGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  @ApiOperation({ summary: 'List student groups with pagination' })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
  ) {
    return this.service.findAll(skip, take);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get student group by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Update student group' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentGroupDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Delete student group' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
