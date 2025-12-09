import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleType } from '../roles/entities/role.entity';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create client (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all clients (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get client by ID (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Client ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
