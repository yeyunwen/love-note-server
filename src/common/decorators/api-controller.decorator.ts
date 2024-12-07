import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IS_PUBLIC_KEY } from './public.decorator';

type ApiControllerPath = string | string[];

interface ApiControllerBaseOptions {
  isPublic?: boolean;
  // 这里可以添加更多通用配置选项
  version?: string;
  description?: string;
}

interface ApiControllerOptionsWithPath extends ApiControllerBaseOptions {
  path: ApiControllerPath;
}

interface ApiControllerOptionsWithoutPath extends ApiControllerBaseOptions {
  path?: never;
}

type ApiControllerOptions =
  | ApiControllerOptionsWithPath
  | ApiControllerOptionsWithoutPath;

export const ApiController = (
  pathOrOptions?: ApiControllerPath | ApiControllerOptions,
): ClassDecorator => {
  return (target: any) => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, target);
    let path: ApiControllerPath;
    let options: ApiControllerBaseOptions = {
      isPublic: false,
    };

    if (typeof pathOrOptions === 'object' && !Array.isArray(pathOrOptions)) {
      path = pathOrOptions.path;
      options = { ...options, ...pathOrOptions };
    } else {
      path = pathOrOptions;
    }
    /**
     * metedata的优先级最高 因为jwt gurad读的是metadata
     * 如果IS_PUBLIC_KEY有设置值，则以IS_PUBLIC_KEY为准
     * 如果IS_PUBLIC_KEY没有设置值，但是options.isPublic === true，则需要设置IS_PUBLIC_KEY为true， 让jwt gurad读取
     */
    if (isPublic === true) {
      options.isPublic = true;
    } else if (isPublic === false) {
      options.isPublic = false;
    } else {
      if (options.isPublic) {
        Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
      }
    }

    if (!options.isPublic) {
      ApiBearerAuth()(target);
    }

    Controller(path)(target);
  };
};
