import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { BaseResponse } from '~/common/entities/response.entity';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = this.formatExceptionMessage(exceptionResponse);

    const data = new BaseResponse<null>();
    data.code = status;
    data.message = message;
    response.status(status).json(data);
  }

  private formatExceptionMessage(
    exceptionResponse: string | Record<string, any>,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const { message } = exceptionResponse;
    console.log('message ====>', message);
    if (typeof message === 'object') {
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      return message.message;
    }

    return message;
  }
}
