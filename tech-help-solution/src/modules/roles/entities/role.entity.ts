import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RoleType {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  CLIENT = 'CLIENT',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true,
  })
  name: RoleType;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

