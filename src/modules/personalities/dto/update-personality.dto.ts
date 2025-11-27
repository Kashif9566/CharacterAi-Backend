import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdatePersonalityDto {
  @IsString()
  @IsOptional()
  trait?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  examples?: string[];
}