import { IsEnum } from 'class-validator';
import { RoleType } from '../entities/role.entity';

export class CreateRoleDto {
  @IsEnum(RoleType)
  name: RoleType;
}
