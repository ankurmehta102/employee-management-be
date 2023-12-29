import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SORT_BY, SORT_ORDER } from './users.controller';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { employeeId, password } = createUserDto;
    const isUserExist = await this.usersRepo.findOneBy({
      employeeId: employeeId,
    });
    if (isUserExist) {
      throw new BadRequestException('User Already Exist');
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.usersRepo.create({
        ...createUserDto,
        password: hashedPassword,
      });
      const { password: savedPassword, ...userWithoutPassword } =
        await this.usersRepo.save(newUser);
      return userWithoutPassword;
    } catch (error) {
      console.log('create/err-->', error);
      throw new BadRequestException(error?.message);
    }
  }

  findAll(sortBy: SORT_BY, sortOrder: SORT_ORDER) {
    try {
      const table = this.usersRepo.createQueryBuilder('User');
      table.select([
        'User.id',
        'User.employeeId',
        'User.firstName',
        'User.lastName',
        'User.department',
        'User.location',
      ]);

      const sortObj = { [`User.${sortBy}`]: `${sortOrder}` };
      table.orderBy(sortObj as { [key: string]: 'ASC' | 'DESC' });
      return table.getMany();
    } catch (err) {
      console.log('findAll/err-->', err);
      throw new BadRequestException(err?.message);
    }
  }

  findOneByEmpId(employeeId: number) {
    return this.usersRepo.findOneBy({
      employeeId: employeeId,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const isEmpExist = await this.usersRepo.findOneBy({
      id,
    });
    if (!isEmpExist) {
      throw new BadRequestException('User does not exist.');
    }
    try {
      const updatedEmployee = this.usersRepo.create({
        id: id,
        ...updateUserDto,
      });
      const { password, ...userWithoutPassword } =
        await this.usersRepo.save(updatedEmployee);
      return userWithoutPassword;
    } catch (err) {
      console.log('update/err-->', err);
      throw new BadRequestException(err?.message);
    }
  }

  async remove(id: number) {
    const isUserExist = await this.usersRepo.findOneBy({
      id,
    });
    if (!isUserExist) {
      throw new BadRequestException('User does not exist.');
    }
    return this.usersRepo.delete(id);
  }
}
