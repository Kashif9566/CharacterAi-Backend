import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}