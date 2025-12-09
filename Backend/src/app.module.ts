import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { getPostgresConfig } from './database/orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getPostgresConfig,
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UsersModule, 
    RolesModule, 
    TechniciansModule, 
    TicketsModule, 
    ClientsModule, 
    CategoriesModule
  ]
})
export class AppModule {}
