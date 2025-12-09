import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const { userId, ...clientData } = createClientDto;
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const client = this.clientsRepository.create({
      ...clientData,
      user,
    });
    
    return this.clientsRepository.save(client);
  }

  findAll() {
    return this.clientsRepository.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.clientsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return this.clientsRepository.update(id, updateClientDto);
  }

  remove(id: number) {
    return this.clientsRepository.delete(id);
  }
}
