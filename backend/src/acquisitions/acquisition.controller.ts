import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AcquisitionService } from './acquisition.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('acquisitions')
@Controller('acquisitions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcquisitionController {
  constructor(private service: AcquisitionService) {}

  @Post('from-order/:id')
  @ApiOperation({ summary: 'Create acquisition from order id and create copies' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  createFromOrder(@Param('id') id: number) {
    return this.service.createFromOrder(Number(id));
  }
}
