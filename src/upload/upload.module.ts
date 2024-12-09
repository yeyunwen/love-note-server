import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '~/note/entities/image.entity';

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
    TypeOrmModule.forFeature([Image]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
