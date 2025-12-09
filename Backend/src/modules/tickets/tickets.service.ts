import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/filters/business-exception.filter';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Client } from '../clients/entities/client.entity';
import { Technician } from '../technicians/entities/technician.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Technician)
    private readonly techniciansRepository: Repository<Technician>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: any) {
    const { clientId, technicianId, categoryId, createdById, ...ticketData } = createTicketDto;

    if (!clientId) {
      throw new BadRequestException('Client is required to create a ticket');
    }
    const client = await this.clientsRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    if (!categoryId) {
      throw new BadRequestException('Category is required to create a ticket');
    }
    const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    const createdBy = await this.usersRepository.findOne({ where: { id: createdById } });
    if (!createdBy) {
      throw new NotFoundException(`User with id ${createdById} not found`);
    }

    let technician: Technician | null = null;
    if (technicianId) {
      technician = await this.techniciansRepository.findOne({ where: { id: technicianId } });
      if (!technician) {
        throw new NotFoundException(`Technician with id ${technicianId} not found`);
      }

      await this.validateTechnicianWorkload(technicianId);
    }

    const ticket = this.ticketsRepository.create({
      ...ticketData,
      client,
      category,
      createdBy,
      ...(technician && { technician }),
    });

    return this.ticketsRepository.save(ticket);
  }

  private async validateTechnicianWorkload(technicianId: number): Promise<void> {
    const inProgressTickets = await this.ticketsRepository.count({
      where: {
        technician: { id: technicianId },
        status: TicketStatus.IN_PROGRESS,
      },
    });

    if (inProgressTickets >= 5) {
      throw new BusinessException(
        `Technician already has ${inProgressTickets} in-progress tickets. Cannot exceed 5.`,
        'TECHNICIAN_WORKLOAD_EXCEEDED',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateStatusTransition(currentStatus: TicketStatus, newStatus: TicketStatus): void {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new BusinessException(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowedTransitions.join(', ') || 'none'}`,
        'INVALID_STATUS_TRANSITION',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(user: any) {
    const { role, sub: userId } = user;

    // ADMIN: see all tickets
    if (role === 'ADMIN') {
      return this.ticketsRepository.find({
        relations: ['client', 'technician', 'category', 'createdBy'],
      });
    }

    // TECHNICIAN: see only assigned tickets
    if (role === 'TECHNICIAN') {
      const userEntity = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['technicianProfile'],
      });
      
      if (!userEntity?.technicianProfile) {
        throw new NotFoundException('Technician profile not found');
      }

      return this.ticketsRepository.find({
        where: { technician: { id: userEntity.technicianProfile.id } },
        relations: ['client', 'technician', 'category', 'createdBy'],
      });
    }

    // CLIENT: see only their tickets
    if (role === 'CLIENT') {
      const userEntity = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['clientProfile'],
      });
      
      if (!userEntity?.clientProfile) {
        throw new NotFoundException('Client profile not found');
      }

      return this.ticketsRepository.find({
        where: { client: { id: userEntity.clientProfile.id } },
        relations: ['client', 'technician', 'category', 'createdBy'],
      });
    }

    return [];
  }

  async findOne(id: number, user: any) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['client', 'technician', 'category', 'createdBy', 'client.user', 'technician.user'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    const { role, sub: userId } = user;

    // ADMIN: can see any ticket
    if (role === 'ADMIN') {
      return ticket;
    }

    // TECHNICIAN: can only see assigned tickets
    if (role === 'TECHNICIAN') {
      if (ticket.technician?.user?.id !== userId) {
        throw new BadRequestException('You can only view tickets assigned to you');
      }
      return ticket;
    }

    // CLIENT: can only see their own tickets
    if (role === 'CLIENT') {
      if (ticket.client?.user?.id !== userId) {
        throw new BadRequestException('You can only view your own tickets');
      }
      return ticket;
    }

    throw new BadRequestException('Unauthorized access');
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, user: any) {
    const { technicianId, categoryId, status, ...updateData } = updateTicketDto;

    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['technician', 'category', 'client', 'createdBy', 'technician.user'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    const { role, sub: userId } = user;

    // TECHNICIAN: can only update assigned tickets and only status
    if (role === 'TECHNICIAN') {
      if (ticket.technician?.user?.id !== userId) {
        throw new BadRequestException('You can only update tickets assigned to you');
      }
      // Technicians can only update status
      if (Object.keys(updateTicketDto).some(key => key !== 'status')) {
        throw new BadRequestException('Technicians can only update ticket status');
      }
    }

    const updatePayload: any = { ...updateData };

    if (status && status !== ticket.status) {
      this.validateStatusTransition(ticket.status, status);
      updatePayload.status = status;
    }

    if (technicianId !== undefined && role === 'ADMIN') {
      if (technicianId === null) {
        updatePayload.technician = null;
      } else {
        const technician = await this.techniciansRepository.findOne({ where: { id: technicianId } });
        if (!technician) {
          throw new NotFoundException(`Technician with id ${technicianId} not found`);
        }

        const futureStatus = status || ticket.status;
        if (futureStatus === TicketStatus.IN_PROGRESS && technicianId !== ticket.technician?.id) {
          await this.validateTechnicianWorkload(technicianId);
        }

        updatePayload.technician = technician;
      }
    }

    if (categoryId && role === 'ADMIN') {
      const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
      updatePayload.category = category;
    }

    await this.ticketsRepository.save({ ...ticket, ...updatePayload });
    
    return this.findOne(id, user);
  }

  async findByClient(clientId: number, user: any) {
    const { role, sub: userId } = user;

    const client = await this.clientsRepository.findOne({
      where: { id: clientId },
      relations: ['user'],
    });

    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    // CLIENT: can only view their own tickets
    if (role === 'CLIENT') {
      const userEntity = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['clientProfile'],
      });

      if (!userEntity?.clientProfile || userEntity.clientProfile.id !== clientId) {
        throw new BadRequestException('You can only view your own ticket history');
      }
    }

    return this.ticketsRepository.find({
      where: { client: { id: clientId } },
      relations: ['client', 'technician', 'category', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTechnician(technicianId: number, user: any) {
    const { role, sub: userId } = user;

    const technician = await this.techniciansRepository.findOne({
      where: { id: technicianId },
      relations: ['user'],
    });

    if (!technician) {
      throw new NotFoundException(`Technician with id ${technicianId} not found`);
    }

    // TECHNICIAN: can only view their own assigned tickets
    if (role === 'TECHNICIAN') {
      const userEntity = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['technicianProfile'],
      });

      if (!userEntity?.technicianProfile || userEntity.technicianProfile.id !== technicianId) {
        throw new BadRequestException('You can only view your own assigned tickets');
      }
    }

    return this.ticketsRepository.find({
      where: { technician: { id: technicianId } },
      relations: ['client', 'technician', 'category', 'createdBy'],
      order: { updatedAt: 'DESC' },
    });
  }

  remove(id: number) {
    return this.ticketsRepository.delete(id);
  }
}
