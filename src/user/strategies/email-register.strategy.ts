// import { HttpException, Inject, Injectable } from '@nestjs/common';
// import { IUserRegister } from '../interfaces/user-register.interface';
// import { CreateUserEmailDto } from '../dto/register.dto';
// import { UserRegisterType } from '../enum';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from '../entities/user.entity';
// import { Repository } from 'typeorm';
// import { REDIS_CLIENT } from '../../common/redis/redis.module';
// import type Redis from 'ioredis';

// @Injectable()
// export class EmailRegisterStrategy
//   implements IUserRegister<UserRegisterType.邮箱>
// {
//   type = UserRegisterType.邮箱;

//   constructor(
//     @InjectRepository(User) private userRepository: Repository<User>,
//     @Inject(REDIS_CLIENT) private redisClient: Redis,
//   ) {}

//   async register(data: CreateUserEmailDto) {
//     // 原有的邮箱注册逻辑
//     const user = await this.userRepository.findOne({
//       where: { email: data.email },
//     });
//     if (user) {
//       throw new HttpException('用户已存在', 200);
//     }
//     const verifyCode = await this.redisClient.get(data.email);
//     if (!verifyCode) {
//       throw new HttpException('验证码已过期', 200);
//     }
//     if (verifyCode !== data.verifyCode) {
//       throw new HttpException('验证码错误', 200);
//     }
//     const password = await this.hashPassword(data.password);
//     const user = this.userRepository.create({
//       email: data.email,
//       password,
//       uid: this.generateUid(),
//       username: await this.generateDefaultUsername(),
//     });
//   }
// }
