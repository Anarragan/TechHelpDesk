import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleType } from '../../roles/entities/role.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;
}
