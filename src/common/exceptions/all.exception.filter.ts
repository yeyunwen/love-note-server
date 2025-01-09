import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const message = new ServiceUnavailableException().getResponse();

    // 非 HTTP 标准异常的处理。
    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      code: HttpStatus.SERVICE_UNAVAILABLE,
      data: null,
      message: this.formatExceptionMessage(message),
    });
  }

  private formatExceptionMessage(
    exceptionResponse: string | Record<string, any>,
  ) {
    console.log('exceptionResponse ====>', exceptionResponse);
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    if (typeof exceptionResponse === 'object') {
      return exceptionResponse.message;
    }

    return exceptionResponse;
  }
}
