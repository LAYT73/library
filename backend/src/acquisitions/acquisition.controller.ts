import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  Query,
  ParseIntPipe,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AcquisitionService } from './acquisition.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AcquisitionListQueryDto } from '../common/dto/list-queries.dto';
import { CreateAcquisitionFromOrderDto } from './dto/create-acquisition-from-order.dto';
import { UpdateAcquisitionDto } from './dto/update-acquisition.dto';

@ApiTags('acquisitions')
@Controller('acquisitions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcquisitionController {
  constructor(private service: AcquisitionService) {}

  @Post('from-order/:id')
  @ApiOperation({
    summary: 'Create acquisition from order id and create copies',
  })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  createFromOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAcquisitionFromOrderDto,
  ) {
    return this.service.createFromOrder(id, dto.totalCost);
  }

  @Get()
  @ApiOperation({ summary: 'List acquisitions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  findAll(@Query() query: AcquisitionListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get acquisition by id' })
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
  @ApiOperation({ summary: 'Update acquisition' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcquisitionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete acquisition' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
