import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Client } from '../clients/entities/client.entity';
import { Technician } from '../technicians/entities/technician.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Client, Technician, Category, User])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
