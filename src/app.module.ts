import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import GLOBAL_CONFIG, { isDev } from './common/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RedisModule } from './common/redis/redis.module';
import { UploadModule } from './upload/upload.module';
import { NoteModule } from './note/note.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [() => GLOBAL_CONFIG],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: GLOBAL_CONFIG.MYSQL_CONFIG.HOST,
      port: GLOBAL_CONFIG.MYSQL_CONFIG.PORT,
      username: GLOBAL_CONFIG.MYSQL_CONFIG.USER,
      password: GLOBAL_CONFIG.MYSQL_CONFIG.PASSWORD,
      database: GLOBAL_CONFIG.MYSQL_CONFIG.DATABASE,
      logging: isDev,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: isDev,
    }),
    UserModule,
    AuthModule,
    RedisModule,
    UploadModule,
    NoteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
