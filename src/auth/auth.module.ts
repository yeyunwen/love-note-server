import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import GLOBAL_CONFIG from '../common/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: GLOBAL_CONFIG.AUTH_CONFIG.JWT_SECRET,
      signOptions: { expiresIn: GLOBAL_CONFIG.AUTH_CONFIG.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
