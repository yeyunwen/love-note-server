import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { BaseResponse } from '~/common/entities/response.entity';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const result = new BaseResponse<T>();
        result.data = data;

        if (data?.code || data?.message) {
          result.message = data?.message ?? result.message;
          result.code = data?.code ?? result.code;
          result.data = data?.data ?? null;
        }

        return result;
      }),
    );
  }
}
