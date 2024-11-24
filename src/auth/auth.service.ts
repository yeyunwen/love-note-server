import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';

export type SafeUserInfo = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<SafeUserInfo | null> {
    const user = await this.userService.findOne(username);
    if (user && (await UserService.validatePassword(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // 去除 password
      return result;
    }
    return null;
  }
}
