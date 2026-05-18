import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DonationService } from './donation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { CreateDonationDto } from './dto/create-donation.dto';

@ApiTags('donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationController {
  constructor(private service: DonationService) {}

  @Post()
  @ApiOperation({ summary: 'Create donation and generate copies' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateDonationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List donations' })
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
  @ApiOperation({ summary: 'Get donation by id' })
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
  @ApiOperation({ summary: 'Update donation' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete donation' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
