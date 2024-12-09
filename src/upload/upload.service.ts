import { Injectable } from '@nestjs/common';
import GLOBAL_CONFIG from '~/common/config';
import sizeOf from 'image-size';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '~/note/entities/image.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async uploadFiles(files: Express.Multer.File[]) {
    return files.map((file) => {
      const { filename, originalname, size } = file;
      const url = `http://localhost:${GLOBAL_CONFIG.SERVER_CONFIG.PORT}/uploads/${filename}`;
      return {
        originalname,
        size,
        url,
      };
    });
  }

  async uploadNoteImage(files: Express.Multer.File[]) {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const { filename, originalname, size } = file;
        const url = `http://localhost:${GLOBAL_CONFIG.SERVER_CONFIG.PORT}/uploads/${filename}`;

        // 获取图片尺寸
        const dimensions = sizeOf(file.path);
        const width = dimensions.width;
        const height = dimensions.height;

        // 保存图片信息到数据库
        const image = this.imageRepository.create({
          url,
          width,
          height,
        });
        await this.imageRepository.save(image);

        return {
          originalname,
          size,
          url,
          width,
          height,
        };
      }),
    );

    return uploadedFiles;
  }
}
