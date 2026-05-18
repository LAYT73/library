import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WriteOffService } from './writeoff.service';
import { CreateWriteOffDto } from './dto/create-writeoff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateWriteOffDto } from './dto/update-writeoff.dto';

@ApiTags('write-offs')
@Controller('write-offs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WriteOffController {
  constructor(private service: WriteOffService) {}

  @Post()
  @ApiOperation({ summary: 'Create write-off and mark copies as written off' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateWriteOffDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List write-offs' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
  ) {
    return this.service.findAll(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get write-off by id' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD, UserRole.VIEWER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update write-off' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWriteOffDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete write-off' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
