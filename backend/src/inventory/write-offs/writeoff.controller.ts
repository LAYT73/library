import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WriteOffService } from './writeoff.service';
import { CreateWriteOffDto } from './dto/create-writeoff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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
}
