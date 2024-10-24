import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import GLOBAL_CONFIG from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [() => GLOBAL_CONFIG],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
