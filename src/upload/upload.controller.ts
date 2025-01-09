import { Post, UploadedFiles, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from '~/upload/upload.service';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { LocalUpload } from '~/common/decorators/local-upload.decorator';
import dayjs from 'dayjs';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('文件上传')
@ApiController('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('local')
  @LocalUpload()
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFiles(files);
  }

  @Post('local/note-image')
  @LocalUpload({
    destination: (req: Request & { destination: string }, file, callback) => {
      const destination = `uploads/note-image/${dayjs().format('YYYYMMDD')}/`;

      if (!existsSync(destination)) {
        mkdirSync(destination, { recursive: true });
      }

      req.destination = destination;
      callback(null, destination);
    },
    description: '上传笔记图片',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  })
  async uploadLocalNoteImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request & { destination: string },
  ) {
    return this.uploadService.uploadLocalNoteImage(files, req.destination);
  }
}
