import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/components/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(employeeId: number, password: string) {
    const existedUser = await this.userService.findOneByEmpId(employeeId);
    if (!existedUser) {
      throw new BadRequestException('User not found.');
    }
    const isPasswordMatched = await bcrypt.compare(
      password,
      existedUser.password,
    );

    if (!isPasswordMatched) {
      throw new BadRequestException('Incorrect Password!');
    }

    const { password: actualPassword, ...userWithoutPassword } = existedUser;
    const payload = {
      employeeId,
      sub: existedUser?.id,
      role: userWithoutPassword?.role,
    };

    return {
      usersDetails: userWithoutPassword,
      tokens: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }
}
