import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.VIEWER;

  @IsString()
  @IsOptional()
  department?: string;
}

export class AuthResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  accessToken: string;
}
