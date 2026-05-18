import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { OrderListQueryDto } from '../../common/dto/list-queries.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private service: OrderService) {}

  @Post('from-request/:id')
  @ApiOperation({ summary: 'Create order from purchase request id' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  createFromRequest(
    @Param('id') id: number,
    @Body() dto: CreateOrderFromRequestDto,
  ) {
    return this.service.createFromRequest(Number(id), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD)
  findAll(@Query() query: OrderListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.DEPARTMENT_HEAD)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
