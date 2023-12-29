import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../../guards/localAuthGuard.guard';
import { RolesEnum } from './entities/user.entity';
import { RolesGuard } from '../../guards/roleGuard.guard';
import { Roles } from '../../decorators/roles.decorator';

export enum SORT_BY {
  LOCATION = 'location',
  NAME = 'firstName',
}
export enum SORT_ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(LocalAuthGuard)
  getAllUser(
    @Query('sortBy', new ParseEnumPipe(SORT_BY))
    sortBy: SORT_BY = SORT_BY.LOCATION,
    @Query('sortOrder', new ParseEnumPipe(SORT_ORDER))
    sortOrder: SORT_ORDER = SORT_ORDER.DESC,
  ) {
    return this.usersService.findAll(sortBy, sortOrder);
  }

  @Get(':id')
  @UseGuards(LocalAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneByEmpId(+id);
  }

  @Patch(':id')
  @Roles(RolesEnum.MANAGER)
  @UseGuards(LocalAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(RolesEnum.MANAGER)
  @UseGuards(LocalAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
