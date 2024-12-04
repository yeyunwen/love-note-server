import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { ConfigService } from '@nestjs/config';

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      // 模拟配置返回值
      const configs = {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '',
        // 添加其他需要的配置
      };
      return configs[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('hash密码正确', async () => {
    const password = '123456';
    const hashedPassword = await service['hashPassword'](password);
    console.log('原始密码:', password);
    console.log('加密结果:', hashedPassword);

    const isValid = await UserService.validatePassword(
      password,
      hashedPassword,
    );
    expect(isValid).toBe(true);
  });

  it('密码相同 hash结果应该不一样', async () => {
    const password1 = '123456';
    const password2 = '123456';
    const hashedPassword1 = await service['hashPassword'](password1);
    const hashedPassword2 = await service['hashPassword'](password2);
    expect(hashedPassword1).not.toBe(hashedPassword2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
