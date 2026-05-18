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
import { CopyService } from './copy.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('copies')
@Controller('copies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CopyController {
  constructor(private service: CopyService) {}

  @Post()
  @ApiOperation({ summary: 'Create copy' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateCopyDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List copies' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
  ) {
    return this.service.findAll(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get copy by id' })
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
  @ApiOperation({ summary: 'Update copy' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCopyDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change status' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    // cast incoming string to enum value
    return this.service.changeStatus(id, status as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete copy' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
