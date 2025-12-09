import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto, UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../roles/entities/role.entity';

@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('tickets')
@UseGuards(RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.CLIENT)
  @ApiOperation({ summary: 'Create a new ticket (ADMIN, CLIENT)' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          title: 'Computer not turning on',
          description: 'My computer has been making strange noises',
          status: 'OPEN',
          priority: 'MEDIUM',
          createdAt: '2025-12-09T10:00:00.000Z',
          updatedAt: '2025-12-09T10:00:00.000Z',
        },
        message: 'Request successful',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data or business rule violation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.TECHNICIAN, RoleType.CLIENT)
  @ApiOperation({ 
    summary: 'Get all tickets',
    description: 'Returns filtered tickets based on role: ADMIN sees all, TECHNICIAN sees assigned, CLIENT sees own tickets'
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 1,
            title: 'Computer not turning on',
            status: 'OPEN',
            priority: 'HIGH',
            client: { id: 1, name: 'John Doe' },
            category: { id: 1, name: 'Hardware' },
          },
        ],
        message: 'Request successful',
      },
    },
  })
  findAll(@CurrentUser() user: any) {
    return this.ticketsService.findAll(user);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.TECHNICIAN, RoleType.CLIENT)
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          title: 'Computer not turning on',
          description: 'Detailed description',
          status: 'OPEN',
          priority: 'HIGH',
          client: { id: 1, name: 'John Doe' },
          technician: { id: 1, name: 'Tech Support' },
          category: { id: 1, name: 'Hardware' },
        },
        message: 'Request successful',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.TECHNICIAN)
  @ApiOperation({ 
    summary: 'Update ticket (ADMIN, TECHNICIAN)',
    description: 'ADMIN can update all fields, TECHNICIAN can only update status of assigned tickets'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition or business rule violation' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.update(+id, updateTicketDto, user);
  }

  @Patch(':id/status')
  @Roles(RoleType.ADMIN, RoleType.TECHNICIAN)
  @ApiOperation({ 
    summary: 'Update ticket status (ADMIN, TECHNICIAN)',
    description: 'Updates only the status with validation of status transitions'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          status: 'IN_PROGRESS',
          updatedAt: '2025-12-09T10:00:00.000Z',
        },
        message: 'Request successful',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateTicketStatusDto, @CurrentUser() user: any) {
    return this.ticketsService.update(+id, updateStatusDto, user);
  }

  @Get('client/:id')
  @Roles(RoleType.ADMIN, RoleType.CLIENT)
  @ApiOperation({ 
    summary: 'Get ticket history by client (ADMIN, CLIENT)',
    description: 'Returns all tickets for a specific client'
  })
  @ApiParam({ name: 'id', description: 'Client ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Client tickets retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 1,
            title: 'Computer issue',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: '2025-12-09T10:00:00.000Z',
          },
        ],
        message: 'Request successful',
      },
    },
  })
  findByClient(@Param('id') clientId: string, @CurrentUser() user: any) {
    return this.ticketsService.findByClient(+clientId, user);
  }

  @Get('technician/:id')
  @Roles(RoleType.ADMIN, RoleType.TECHNICIAN)
  @ApiOperation({ 
    summary: 'Get tickets by technician (ADMIN, TECHNICIAN)',
    description: 'Returns all tickets assigned to a specific technician'
  })
  @ApiParam({ name: 'id', description: 'Technician ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Technician tickets retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 1,
            title: 'Computer issue',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            assignedAt: '2025-12-09T10:00:00.000Z',
          },
        ],
        message: 'Request successful',
      },
    },
  })
  findByTechnician(@Param('id') technicianId: string, @CurrentUser() user: any) {
    return this.ticketsService.findByTechnician(+technicianId, user);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete ticket (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
