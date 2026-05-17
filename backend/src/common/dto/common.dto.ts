export class ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export class PaginationDto {
  skip: number;
  take: number;
}

export class PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
