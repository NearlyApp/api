import { DrizzleModule } from '@drizzle/drizzle.module';
import { Module } from '@nestjs/common';
import { LikesController } from '@posts/likes/likes.controller';
import { LikesRepository } from '@posts/likes/likes.repository';
import { LikesService } from '@posts/likes/likes.service';
import { UsersModule } from '@users/users.module';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController, LikesController],
  providers: [PostsRepository, PostsService, LikesRepository, LikesService],
  exports: [PostsRepository, PostsService],
  imports: [DrizzleModule, UsersModule],
})
export class PostsModule {}
