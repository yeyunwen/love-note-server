import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { RegisterDataMap, UserRegisterType } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import Redis from 'ioredis';

// 将 scrypt 转换为 Promise 版本
const scryptAsync = promisify(scrypt);

@Injectable()
export class UserService {
  private strategies: Map<
    UserRegisterType,
    (data: RegisterDataMap[UserRegisterType]) => Promise<User>
  >;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {
    this.strategies = new Map([[UserRegisterType.邮箱, this.emailRegister]]);
  }

  private generateUid(): string {
    const uid = uuidv4();
    const numericUid = uid
      .replace(/-/g, '')
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
    return numericUid.slice(0, 12);
  }
  private async generateDefaultUsername() {
    const randomNumber = Math.floor(Math.random() * 100000);
    return `user_${randomNumber}`;
  }
  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return salt + ':' + derivedKey.toString('hex');
  }
  static async validatePassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return derivedKey.toString('hex') === hash;
  }

  async register(registerDto: RegisterDto) {
    const strategy = this.strategies.get(registerDto.type);
    if (!strategy) {
      throw new BadRequestException('不支持的注册方式');
    }

    let data: RegisterDataMap[UserRegisterType];
    switch (registerDto.type) {
      case UserRegisterType.邮箱:
        data = registerDto.emailData;
        break;
    }

    if (!data) {
      throw new BadRequestException('缺少注册数据');
    }

    await strategy(data);
  }

  private emailRegister = async (
    data: RegisterDataMap[UserRegisterType.邮箱],
  ) => {
    // 原有的邮箱注册逻辑
    const findUser = await this.findByEmail(data.email);
    if (findUser) {
      throw new HttpException('用户已存在', 200);
    }
    const verifyCode = await this.redisClient.get(data.email);
    if (!verifyCode) {
      throw new HttpException('验证码已过期', 200);
    }
    if (verifyCode !== data.verifyCode) {
      throw new HttpException('验证码错误', 200);
    }
    const password = await this.hashPassword(data.password);
    const user = this.userRepository.create({
      email: data.email,
      password,
      uid: this.generateUid(),
      username: await this.generateDefaultUsername(),
    });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  };

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.findByEmail(email);
    return user && (await UserService.validatePassword(password, user.password))
      ? user
      : null;
  }

  // async createByEmail(createUserDto: CreateUserEmailDto) {
  //   const hasUser = await this.userRepository.findOne({
  //     where: { email: createUserDto.email },
  //   });
  //   if (hasUser) {
  //     throw new HttpException('用户已存在', 200);
  //   }
  //   const password = await this.hashPassword(createUserDto.password);
  //   const user = this.userRepository.create({
  //     ...createUserDto,
  //     password,
  //     uid: this.generateUid(),
  //     username: await this.generateDefaultUsername(),
  //   });
  //   await this.userRepository.save(user);
  //   return user;
  // }

  async bindLover(userUid: string, loverUid: string): Promise<void> {
    if (userUid === loverUid) {
      throw new HttpException('不能绑定自己', 200);
    }
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    const lover = await this.userRepository.findOne({
      where: { uid: loverUid },
    });
    if (!user || !lover) {
      throw new HttpException('用户不存在', 200);
    }
    if (user.lover || lover.lover) {
      throw new HttpException('用户已有恋人', 200);
    }
    user.lover = lover;
    lover.lover = user;
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(lover);
      },
    );
  }

  async unbindLover(userUid: string) {
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    if (!user || !user.lover) {
      throw new HttpException('用户没有恋人', 200);
    }

    const partner = await this.userRepository.findOne({
      where: { uid: user.lover.uid },
    });
    if (!partner) {
      throw new HttpException('恋人不存在', 200);
    }

    // 解除双方绑定
    user.lover = null;
    partner.lover = null;

    // 使用事务保存
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(partner);
      },
    );
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(username: string) {
    return this.userRepository.findOne({
      where: { username },
    });
  }
}
