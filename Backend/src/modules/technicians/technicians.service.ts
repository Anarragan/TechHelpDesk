import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './entities/technician.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician) 
    private readonly techniciansRepository: Repository<Technician>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createTechnicianDto: CreateTechnicianDto) {
    const { userId, ...technicianData } = createTechnicianDto;
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const technician = this.techniciansRepository.create({
      ...technicianData,
      user,
    });
    
    return this.techniciansRepository.save(technician);
  }

  findAll() {
    return this.techniciansRepository.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.techniciansRepository.findOne({ where: { id }, relations: ['user'] });
  }

  update(id: number, updateTechnicianDto: UpdateTechnicianDto) {
    return this.techniciansRepository.update(id, updateTechnicianDto);
  }

  remove(id: number) {
    return this.techniciansRepository.delete(id);
  }
}
