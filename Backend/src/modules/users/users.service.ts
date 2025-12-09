import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { role: roleName, ...userData } = createUserDto;
    
    let role: Role | null = null;
    if (roleName) {
      role = await this.rolesRepository.findOne({ where: { name: roleName } });
      if (!role) {
        throw new NotFoundException(`Role "${roleName}" not found`);
      }
    }

    const user = this.usersRepository.create({
      ...userData,
      ...(role && { role }),
    });
    
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { role: roleName, ...userData } = updateUserDto;
    
    const updateData: any = { ...userData };
    
    if (roleName) {
      const role = await this.rolesRepository.findOne({ where: { name: roleName } });
      if (!role) {
        throw new NotFoundException(`Role "${roleName}" not found`);
      }
      updateData.role = role;
    }
    
    return this.usersRepository.update(id, updateData);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
