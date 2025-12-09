import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  specialty: string;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @IsInt()
  userId: number;
}
