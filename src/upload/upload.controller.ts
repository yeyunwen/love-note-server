import { Post, UploadedFiles } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from '~/upload/upload.service';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { LocalUpload } from '~/common/decorators/local-upload.decorator';

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
    description: '上传笔记图片',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  })
  async uploadLocalNoteImage(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadLocalNoteImage(files);
  }
}
