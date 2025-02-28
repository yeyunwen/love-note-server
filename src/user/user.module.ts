import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from '~/common/email/email.module';
// import { EmailRegisterStrategy } from './strategies/email-register.strategy';
import { RedisModule } from '~/common/redis/redis.module';
import { LoverRequest } from './entities/lover-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LoverRequest]),
    EmailModule,
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
