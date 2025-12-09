import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleType } from '../roles/entities/role.entity';

@ApiTags('Technicians')
@ApiBearerAuth('JWT-auth')
@Controller('technicians')
@UseGuards(RolesGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create technician (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Technician created successfully' })
  create(@Body() createTechnicianDto: CreateTechnicianDto) {
    try {
      const technician = this.techniciansService.create(createTechnicianDto);
      return technician;
    } catch (error) {
      return { message: 'Error creating technician', error };
    }
  }

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all technicians (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Technicians retrieved successfully' })
  findAll() {
    try {
      const technicians = this.techniciansService.findAll();
      return technicians;
    } catch (error) {
      return { message: 'Error retrieving technicians', error };
    }
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    try {
      const technician = this.techniciansService.findOne(+id);
      return technician;
    } catch (error) {
      return { message: `Error retrieving technician with id ${id}`, error };
    }
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  update(@Param('id') id: string, @Body() updateTechnicianDto: UpdateTechnicianDto) {
    try {
      const technician = this.techniciansService.update(+id, updateTechnicianDto);
      return technician;
    } catch (error) {
      return { message: `Error updating technician with id ${id}`, error };
    }
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string) {
    try {
      const result = this.techniciansService.remove(+id);
      return result;
    } catch (error) {
      return { message: `Error deleting technician with id ${id}`, error };
    }
  }
}
