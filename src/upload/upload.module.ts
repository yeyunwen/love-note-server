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
          /**
           * 以下代码是用于解决multer对文件名中文编码处理的问题
           * 代码被注释掉了，因为文件名中文编码问题似乎已经被解决了
           */
          // if (file.originalname) {
          // file.originalname = Buffer.from(
          //   file.originalname,
          //   'binary',
          // ).toString('utf8');
          // }
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
