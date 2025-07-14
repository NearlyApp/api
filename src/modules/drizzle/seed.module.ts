import { ConfigModule } from '@config/config.module';
import { DrizzleModule } from '@drizzle/drizzle.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule, DrizzleModule],
})
export class SeedModule {}
