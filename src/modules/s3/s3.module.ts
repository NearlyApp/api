import { S3Service } from '@/modules/s3/s3.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
