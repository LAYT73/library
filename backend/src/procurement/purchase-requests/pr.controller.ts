import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PurchaseRequestService } from './pr.service';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdatePurchaseRequestDto } from './dto/update-pr.dto';

@ApiTags('purchase-requests')
@Controller('purchase-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseRequestController {
  constructor(private service: PurchaseRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase request with items' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreatePurchaseRequestDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase request by id' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD)
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Get()
  @ApiOperation({ summary: 'List purchase requests' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD)
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
  ) {
    return this.service.findAll(skip, take);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase request' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseRequestDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase request' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
