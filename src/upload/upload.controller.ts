import { extname } from 'node:path';
import {
  Post,
  UploadedFiles,
  UseInterceptors,
  Controller,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import GLOBAL_CONFIG from '../common/config';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('local')
  @UseInterceptors(
    FilesInterceptor('files', GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_COUNT, {
      storage: diskStorage({
        destination: GLOBAL_CONFIG.UPLOAD_CONFIG.DESTINATION,
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE * 1024 * 1024,
        files: GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_COUNT,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFiles(files);
  }
}
