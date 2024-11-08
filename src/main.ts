import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import GLOBAL_CONFIG from './common/config';
import { generateDocument } from './doc';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  generateDocument(app);
  await app.listen(GLOBAL_CONFIG.SERVER_CONFIG.PORT);
}
bootstrap();
