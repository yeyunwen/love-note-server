import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs';

@Injectable()
export class TransformDateInterceptor implements NestInterceptor {
  // 需要转换的字段名列表
  private readonly dateFields = ['createdTime', 'updatedTime'];

  private formatDate(date: Date): string {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  private transform(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    }

    if (typeof data === 'object') {
      // 处理当前对象的日期字段
      this.dateFields.forEach((field) => {
        if (field in data && data[field] instanceof Date) {
          data[field] = this.formatDate(data[field]);
        }
      });

      // 递归处理对象的所有属性
      for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
          data[key] = this.transform(data[key]);
        }
      }

      return data;
    }

    return data;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}
