import { IsOptional, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Hardware',
    description: 'Category name',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    example: 'Hardware related issues',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
