import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { LoverRequest } from './entities/lover-request.entity';
import { LoverRequestStatus } from './entities/lover-request.entity';

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
    @InjectRepository(LoverRequest)
    private loverRequestRepository: Repository<LoverRequest>,
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
      relations: [
        'lover',
        'sentRequests',
        'sentRequests.receiver',
        'receivedRequests',
        'receivedRequests.sender',
      ],
      select: {
        lover: {
          uid: true,
          username: true,
          gender: true,
          avatar: true,
        },
        receivedRequests: {
          id: true,
          status: true,
          createdTime: true,
          updatedTime: true,
          sender: {
            uid: true,
            username: true,
            gender: true,
            avatar: true,
          },
        },
        sentRequests: {
          id: true,
          status: true,
          createdTime: true,
          updatedTime: true,
          receiver: {
            uid: true,
            username: true,
            gender: true,
            avatar: true,
          },
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
   * 发送绑定恋人请求
   */
  async sendLoverRequest(
    senderUid: string,
    receiverUid: string,
  ): Promise<void> {
    if (senderUid === receiverUid) {
      throw new HttpException('不能绑定自己', HttpStatus.BAD_REQUEST);
    }

    const [sender, receiver] = await Promise.all([
      this.userRepository.findOne({
        where: { uid: senderUid },
        relations: ['lover'],
      }),
      this.userRepository.findOne({
        where: { uid: receiverUid },
        relations: ['lover'],
      }),
    ]);

    if (!sender || !receiver) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (sender.lover || receiver.lover) {
      throw new HttpException('用户已有恋人', HttpStatus.BAD_REQUEST);
    }

    // 检查是否已经存在未处理的请求
    const existingRequest = await this.loverRequestRepository.findOne({
      where: [
        {
          sender: { uid: senderUid },
          receiver: { uid: receiverUid },
          status: LoverRequestStatus.待处理,
        },
        {
          sender: { uid: receiverUid },
          receiver: { uid: senderUid },
          status: LoverRequestStatus.待处理,
        },
      ],
      relations: ['sender', 'receiver'],
    });

    if (existingRequest) {
      if (existingRequest.sender.uid === senderUid) {
        throw new HttpException(
          '你已经向对方发送过绑定请求，请等待对方处理',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          '对方已向你发送绑定请求，请先处理对方的请求',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const request = this.loverRequestRepository.create({
      sender,
      receiver,
      status: LoverRequestStatus.待处理,
    });

    await this.loverRequestRepository.save(request);
  }

  /**
   * 处理绑定请求
   */
  async handleLoverRequest(
    receiverUid: string,
    requestId: number,
    accept: boolean,
  ): Promise<void> {
    // 1. 查找对应的请求记录

    const request = await this.loverRequestRepository.findOne({
      where: {
        id: requestId,
        receiver: { uid: receiverUid },
        status: LoverRequestStatus.待处理,
      },
      relations: ['sender', 'receiver'],
    });

    // 2. 验证请求是否存在
    if (!request) {
      throw new HttpException('请求不存在或已处理', HttpStatus.BAD_REQUEST);
    }

    // 3. 如果选择接受请求
    if (accept) {
      // 3.1 重新检查双方是否已有恋人
      const [sender, receiver] = await Promise.all([
        this.userRepository.findOne({
          where: { uid: request.sender.uid },
          relations: ['lover'],
        }),
        this.userRepository.findOne({
          where: { uid: request.receiver.uid },
          relations: ['lover'],
        }),
      ]);

      if (sender.lover || receiver.lover) {
        throw new HttpException('用户已有恋人', HttpStatus.BAD_REQUEST);
      }

      // 3.2 使用事务来确保数据一致性
      await this.userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // 互相设置为恋人
          sender.lover = receiver;
          receiver.lover = sender;
          // 更新请求状态为已接受
          request.status = LoverRequestStatus.已接受;

          // 保存所有更改
          await transactionalEntityManager.save(sender);
          await transactionalEntityManager.save(receiver);
          await transactionalEntityManager.save(request);
        },
      );
    } else {
      // 4. 如果拒绝请求，只需更新请求状态
      request.status = LoverRequestStatus.已拒绝;
      await this.loverRequestRepository.save(request);
    }
  }

  // 获取用户的请求列表
  async getLoverRequests(userUid: string) {
    return this.loverRequestRepository.find({
      where: [{ sender: { uid: userUid } }, { receiver: { uid: userUid } }],
      relations: ['sender', 'receiver'],
      order: { createdTime: 'DESC' },
    });
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
