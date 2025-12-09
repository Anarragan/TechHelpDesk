import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum } from 'class-validator';
import { RoleType } from 'src/modules/roles/entities/role.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsEnum(RoleType)
    role?: RoleType;
}
