import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsEmail()
  contactEmail: string;

  @IsInt()
  userId: number;
}
