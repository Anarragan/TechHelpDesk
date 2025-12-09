import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  ValidationExceptionFilter,
  BusinessExceptionFilter,
} from './filters';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RolesGuard,
    JwtAuthGuard,
    TransformInterceptor,
    HttpExceptionFilter,
    AllExceptionsFilter,
    ValidationExceptionFilter,
    BusinessExceptionFilter,
  ],
  exports: [
    RolesGuard,
    JwtAuthGuard,
    TransformInterceptor,
    HttpExceptionFilter,
    AllExceptionsFilter,
    ValidationExceptionFilter,
    BusinessExceptionFilter,
    JwtModule,
  ],
})
export class CommonModule {}
