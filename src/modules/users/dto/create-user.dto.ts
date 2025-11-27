import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}