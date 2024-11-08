import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import GLOBAL_CONFIG from './common/config';

console.log(__dirname);

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
