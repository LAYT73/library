import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderFromRequestDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private service: OrderService) {}

  @Post('from-request/:id')
  @ApiOperation({ summary: 'Create order from purchase request id' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  createFromRequest(@Param('id') id: number, @Body() dto: CreateOrderFromRequestDto) {
    return this.service.createFromRequest(Number(id), dto);
  }
}
