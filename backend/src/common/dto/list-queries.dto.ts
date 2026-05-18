import { CopyStatus, OrderStatus, PurchaseRequestStatus, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class BookListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class CopyListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CopyStatus)
  status?: CopyStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bookId?: number;
}

export class PurchaseRequestListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PurchaseRequestStatus)
  status?: PurchaseRequestStatus;
}

export class OrderListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;
}

export class DisciplineListQueryDto extends PaginationQueryDto {
  @IsOptional()
  department?: string;
}

export class UserListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class CoverageListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  disciplineId?: number;
}

export class AssignmentListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  disciplineId?: number;
}

export class AcquisitionListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;
}
