import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleType } from '../roles/entities/role.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create user (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return user;
    } catch (error) {
      throw new Error('User creation failed');
    }
  }

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all users (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    try {
      const users = await this.usersService.findAll();      
      return users;
    } catch (error) {
      throw new Error('Failed to retrieve users');
    }
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(+id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error('Failed to retrieve user');
    }
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(+id, updateUserDto);
      return updatedUser;
    } catch (error) {
      throw new Error('User update failed');
    }
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(+id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error('User deletion failed');
    }
  }
}
