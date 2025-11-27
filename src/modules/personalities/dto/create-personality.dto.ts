import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePersonalityDto {
  @IsString()
  trait: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  examples?: string[];
}