import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import type Redis from 'ioredis';
import { EmailService } from 'src/common/email/email.service';

export type SafeUserInfo = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {}

  async loginByEmail(email: string, password: string) {
    return await this.userService.validateUserByEmail(email, password);
  }

  async sendEmailVerifyCode(address: string) {
    const verifyCode = Math.random().toString(36).substring(2, 15);
    await this.redisClient.set(address, verifyCode, 'EX', 60 * 5);
    await this.emailService.sendMail({
      to: address,
      subject: '验证码',
      html: `<p>您的验证码是：${verifyCode}</p>`,
    });
    return verifyCode;
  }
}
