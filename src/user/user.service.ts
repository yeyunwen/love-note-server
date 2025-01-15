import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto, RegisterDataMap } from './dto/register.dto';
import { UserRegisterType } from './types/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { REDIS_CLIENT } from '~/common/redis/redis.module';
import Redis from 'ioredis';

// 将 scrypt 转换为 Promise 版本
const scryptAsync = promisify(scrypt);

@Injectable()
export class UserService {
  private strategies: Map<
    UserRegisterType,
    (data: RegisterDataMap[UserRegisterType]) => Promise<User>
  >;

  static generateUid(): string {
    const uid = uuidv4();
    const numericUid = uid
      .replace(/-/g, '')
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
    return numericUid.slice(0, 12);
  }

  static async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return salt + ':' + derivedKey.toString('hex');
  }
  static async validatePassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return derivedKey.toString('hex') === hash;
  }

  private async generateDefaultUsername() {
    const randomNumber = Math.floor(Math.random() * 100000);
    return `user_${randomNumber}`;
  }

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {
    this.strategies = new Map([[UserRegisterType.邮箱, this.emailRegister]]);
  }

  async register(registerDto: RegisterDto) {
    const strategy = this.strategies.get(registerDto.type as UserRegisterType);
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
    const password = await UserService.hashPassword(data.password);
    const user = this.userRepository.create({
      email: data.email,
      password,
      uid: UserService.generateUid(),
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

  async getUserInfo(uid: string) {
    const user = await this.userRepository.findOne({
      where: { uid },
      relations: ['lover', 'loverRequest'],
      select: {
        lover: {
          uid: true,
          username: true,
          gender: true,
          avatar: true,
        },
        loverRequest: {
          uid: true,
          username: true,
          gender: true,
          avatar: true,
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return safeUser;
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

  /**
   * 绑定恋人请求
   */
  async bindLoverRequest(userUid: string, loverUid: string): Promise<void> {
    if (userUid === loverUid) {
      throw new HttpException('不能绑定自己', 200);
    }
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    const lover = await this.userRepository.findOne({
      where: { uid: loverUid },
      relations: ['loverRequest'],
    });
    if (!user || !lover) {
      throw new HttpException('用户不存在', 200);
    }
    if (user.lover || lover.lover) {
      throw new HttpException('用户已有恋人', 200);
    }
    if (lover.loverRequest?.uid === userUid) {
      throw new HttpException('对方已向你发送绑定请求', 200);
    }
    // 设置请求状态为 pending
    user.loverRequest = lover;
    await this.userRepository.save(user);
  }

  /**
   * 接受恋人请求
   */
  async acceptLoverRequest(userUid: string, loverUid: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    const lover = await this.userRepository.findOne({
      where: { uid: loverUid },
      relations: ['loverRequest'],
    });
    if (!user || !lover) {
      throw new HttpException('用户不存在', 200);
    }
    if (lover.loverRequest?.uid !== userUid) {
      throw new HttpException('对方没有向你发送绑定请求', 200);
    }
    if (user.lover) {
      throw new HttpException('你已与其他人绑定', 200);
    }
    if (lover.lover) {
      throw new HttpException('对方已与其他人绑定', 200);
    }
    // 双方同意绑定
    user.lover = lover;
    lover.lover = user;
    user.loverRequest = null; // 清除请求状态
    lover.loverRequest = null; // 清除请求状态
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(lover);
      },
    );
  }

  async unbindLover(userUid: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
      relations: ['lover'], // 确保加载 lover 关系
    });

    if (!user || !user.lover) {
      throw new HttpException('用户不存在或未绑定', 200);
    }

    const lover = user.lover;

    // 解除绑定
    user.lover = null;
    lover.lover = null;

    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(lover);
      },
    );
  }

  async insertTestUser() {
    const testUser = this.userRepository.create({
      uid: 'test_uid',
      email: 'test@example.com',
      username: 'testuser',
      password: await UserService.hashPassword('testpassword'),
    });

    await this.userRepository.save(testUser);
  }
}
