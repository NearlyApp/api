import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const ImageInterceptor = (key: string = 'image') =>
  FileInterceptor(key, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files are allowed'), false);
      }
    },
  });

export default ImageInterceptor;
