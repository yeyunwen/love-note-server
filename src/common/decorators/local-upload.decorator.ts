import {
  applyDecorators,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { LocalUploadConfig } from '~/upload/upload.config';
import { UploadConfig } from '~/upload/upload.config';

export interface LocalUploadOptions extends Partial<LocalUploadConfig> {
  /** Swagger文档描述 */
  description?: string;
  /** 是否必须上传文件 */
  required?: boolean;
  /** 允许的文件类型 */
  allowedMimeTypes?: string[];
}

export function LocalUpload(options: LocalUploadOptions = {}) {
  const {
    description = '文件上传',
    required = true,
    allowedMimeTypes,
    ...config
  } = options;

  const validators = [];

  if (allowedMimeTypes?.length) {
    validators.push(
      new FileTypeValidator({
        fileType: new RegExp(allowedMimeTypes.join('|')),
      }),
    );
  }

  return applyDecorators(
    UseInterceptors(UploadConfig.getLocalFilesInterceptor(config)),
    UsePipes(new ParseFilePipe({ validators, fileIsRequired: required })),
    ApiConsumes('multipart/form-data'),
    ApiBody(UploadConfig.getLocalApiBodySchema()),
    ApiOperation({ summary: description }),
  );
}
