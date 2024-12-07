import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ClassDecorator & MethodDecorator => {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    if (descriptor) {
      // 作用于方法
      return applyDecorators(
        SetMetadata(IS_PUBLIC_KEY, true),
        ApiOperation({ security: [] }),
      )(target, propertyKey, descriptor);
    }
    // 作用于类
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    // 移除类级别的安全要求
    ApiSecurity('bearer', [])(target);
    return target;
  };
};
