import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '~/common/types';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      async useFactory(configService: ConfigService<AppConfig>) {
        const REDIS_CONFIG = configService.get('REDIS_CONFIG', {
          infer: true,
        });
        const client = new Redis({
          host: REDIS_CONFIG.HOST,
          port: REDIS_CONFIG.PORT,
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
