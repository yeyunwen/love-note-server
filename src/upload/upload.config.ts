import { extname } from 'node:path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import GLOBAL_CONFIG from '~/common/config';

export interface LocalUploadConfig {
  /** 文件存储路径
   * @default GLOBAL_CONFIG.UPLOAD_CONFIG.DESTINATION uploads
   */
  destination: string;
  /** 最大文件数量
   * @default GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_COUNT 9
   */
  maxFileCount: number;
  /** 最大文件大小
   * @default GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE 10MB
   */
  maxFileSize: number;
}

const defaultConfig: LocalUploadConfig = {
  destination: GLOBAL_CONFIG.UPLOAD_CONFIG.DESTINATION,
  maxFileCount: GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_COUNT,
  maxFileSize: GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE,
};

export class UploadConfig {
  static getLocalFilesInterceptor(config: Partial<LocalUploadConfig> = {}) {
    const { destination, maxFileCount, maxFileSize } = {
      ...defaultConfig,
      ...config,
    };
    return FilesInterceptor('files', maxFileCount, {
      storage: diskStorage({
        destination,
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: maxFileSize * 1024 * 1024,
        files: maxFileCount,
      },
    });
  }

  static getLocalApiBodySchema() {
    return {
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    };
  }
}
