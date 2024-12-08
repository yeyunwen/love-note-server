import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '~/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import GLOBAL_CONFIG from '~/common/config';
import { EmailService } from '~/common/email/email.service';
import { RedisModule } from '~/common/redis/redis.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: GLOBAL_CONFIG.AUTH_CONFIG.JWT_SECRET,
      signOptions: { expiresIn: GLOBAL_CONFIG.AUTH_CONFIG.JWT_EXPIRES_IN },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
})
export class AuthModule {}
