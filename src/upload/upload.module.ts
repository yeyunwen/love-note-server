import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      fileFilter: (req, file, callback) => {
        try {
          if (file.originalname) {
            file.originalname = Buffer.from(
              file.originalname,
              'binary',
            ).toString('utf8');
          }
          callback(null, true);
        } catch (err) {
          callback(new Error('文件名编码错误'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
