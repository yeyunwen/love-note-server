import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { BaseResponse } from '../entities/response.entity';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const data = new BaseResponse<null>();
    data.code = status;
    data.message = exception.getResponse() as string;
    console.log('data', data);
    response.status(status).json(data);
  }
}
