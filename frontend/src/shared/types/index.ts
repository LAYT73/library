export const UserRole = {
  ADMIN: 'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  VIEWER: 'VIEWER',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleType;
  department?: string;
  accessToken: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleType;
  department?: string;
  accessToken: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  publisher: string;
  year: number;
  authorId: number;
  author?: {
    id: number;
    fullName: string;
  };
}

export interface Copy {
  id: number;
  inventoryNumber: number;
  status: CopyStatusType;
  bookId: number;
  acquisitionId?: number;
}

export const CopyStatus = {
  AVAILABLE: 'AVAILABLE',
  ISSUED: 'ISSUED',
  WRITTEN_OFF: 'WRITTEN_OFF',
  LOST: 'LOST',
} as const;

export type CopyStatusType = (typeof CopyStatus)[keyof typeof CopyStatus];

export interface Discipline {
  id: number;
  name: string;
  department: string;
}

export interface StudentGroup {
  id: number;
  name: string;
  studentCount: number;
}

export interface Coverage {
  id: number;
  requiredCount: number;
  bookId: number;
  disciplineId: number;
}

export interface CoverageReport {
  disciplineId: number;
  discipline: string;
  department: string;
  totalRequired: number;
  totalAvailable: number;
  coveragePercent: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
