import 'tsconfig-paths/register';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { generateDocument } from './doc';
import GLOBAL_CONFIG from './common/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/all.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 开启数据转换
      whitelist: true, // 过滤掉未定义的属性
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useStaticAssets(
    join(__dirname, '..', GLOBAL_CONFIG.UPLOAD_CONFIG.DESTINATION),
    {
      prefix: `/${GLOBAL_CONFIG.UPLOAD_CONFIG.DESTINATION}/`,
    },
  );
  generateDocument(app);
  await app.listen(GLOBAL_CONFIG.SERVER_CONFIG.PORT);
}
bootstrap();
