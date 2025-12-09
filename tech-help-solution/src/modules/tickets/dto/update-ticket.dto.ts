import { IsOptional, IsEnum, IsInt, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { TicketStatus, PriorityLevel } from '../entities/ticket.entity';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    example: 'Updated ticket title',
    description: 'Ticket title',
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description with more details',
    description: 'Detailed description of the issue',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    description: 'Ticket status',
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    example: 'HIGH',
    description: 'Ticket priority level',
    enum: PriorityLevel,
  })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({
    example: 1,
    description: 'Technician ID to assign',
  })
  @IsOptional()
  @IsInt()
  technicianId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Category ID to update',
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}

export class UpdateTicketStatusDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'New ticket status',
    enum: TicketStatus,
  })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}
