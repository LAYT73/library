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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BookListQueryDto } from '../../common/dto/list-queries.dto';

@ApiTags('books')
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(private service: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create book' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateBookDto, @Request() req: { user?: { sub: string } }) {
    return this.service.create(dto, req.user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List books with pagination' })
  @Roles(
    UserRole.ADMIN,
    UserRole.LIBRARIAN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.VIEWER,
  )
  findAll(@Query() query: BookListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by id' })
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
  @ApiOperation({ summary: 'Update book' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
    @Request() req: { user?: { sub: string } },
  ) {
    return this.service.update(id, dto, req.user?.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book' })
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user?: { sub: string } }) {
    return this.service.remove(id, req.user?.sub);
  }
}
