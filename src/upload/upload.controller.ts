import { extname } from 'node:path';
import { Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from '~/upload/upload.service';
import GLOBAL_CONFIG from '~/common/config';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { Public } from '~/common/decorators/public.decorator';

@ApiTags('文件上传')
@ApiController('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  private static getFilesInterceptor() {
    return FilesInterceptor(
      'files',
      GLOBAL_CONFIG.UPLOAD_CONFIG.MAX_FILE_COUNT,
      {
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
      },
    );
  }

  private static getApiBodySchema() {
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

  @Post('local')
  @UseInterceptors(UploadController.getFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadController.getApiBodySchema())
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFiles(files);
  }

  @Post('note-image')
  @Public()
  @UseInterceptors(UploadController.getFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadController.getApiBodySchema())
  async uploadNoteImage(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadNoteImage(files);
  }
}
