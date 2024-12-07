import { Injectable } from '@nestjs/common';
import GLOBAL_CONFIG from '../common/config';
@Injectable()
export class UploadService {
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
}
