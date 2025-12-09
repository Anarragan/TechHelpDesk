import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, PriorityLevel } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    example: 'Computer not turning on',
    description: 'Ticket title',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({
    example: 'My computer has been making strange noises and now it won\'t turn on',
    description: 'Detailed description of the issue',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({
    example: 'OPEN',
    description: 'Ticket status',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    example: 'HIGH',
    description: 'Ticket priority level',
    enum: PriorityLevel,
    default: PriorityLevel.MEDIUM,
  })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiProperty({
    example: 1,
    description: 'Client ID who created the ticket',
  })
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Technician ID assigned to the ticket',
  })
  @IsOptional()
  @IsInt()
  technicianId?: number;

  @ApiProperty({
    example: 1,
    description: 'Category ID of the ticket',
  })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'User ID who created the ticket',
  })
  @IsInt()
  createdById: number;
}
