import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import GLOBAL_CONFIG from './common/config';
import { generateDocument } from './doc';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/all.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  generateDocument(app);
  await app.listen(GLOBAL_CONFIG.SERVER_CONFIG.PORT);
}
bootstrap();
