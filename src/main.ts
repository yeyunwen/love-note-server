import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import GLOBAL_CONFIG from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(GLOBAL_CONFIG.SERVER_CONFIG.PORT);
}
bootstrap();
