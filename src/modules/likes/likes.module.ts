import { DrizzleModule } from '@drizzle/drizzle.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';
import { LikesController } from './likes.controller';
import { LikesRepository } from './likes.repository';
import { LikesService } from './likes.service';

@Module({
  controllers: [LikesController],
  providers: [LikesRepository, LikesService],
  exports: [LikesRepository, LikesService],
  imports: [DrizzleModule, UsersModule],
})
export class LikesModule {}
