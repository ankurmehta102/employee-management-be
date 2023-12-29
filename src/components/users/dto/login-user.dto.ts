import { CreateUserDto } from './create-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class loginUserDto extends PickType(CreateUserDto, [
  'employeeId',
  'password',
]) {}
