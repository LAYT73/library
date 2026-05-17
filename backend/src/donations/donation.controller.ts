import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DonationService } from './donation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationController {
  constructor(private service: DonationService) {}

  @Post()
  @ApiOperation({ summary: 'Create donation and generate copies' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: { donorName: string; items: { bookId: number; quantity: number }[] }) {
    return this.service.create(dto);
  }
}
