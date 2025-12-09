import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150 })
  specialty: string;

  @Column({ default: true })
  availability: boolean;

  @OneToOne(() => User, (user) => user.technicianProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.technician)
  assignedTickets: Ticket[];
}

