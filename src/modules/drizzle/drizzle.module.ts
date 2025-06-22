import { DrizzleService } from '@drizzle/drizzle.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
