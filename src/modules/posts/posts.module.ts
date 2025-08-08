import { DrizzleModule } from '@drizzle/drizzle.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';
import { UsersService } from '@users/users.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
  exports: [PostsRepository, PostsService],
  imports: [DrizzleModule, UsersModule, UsersService],
})
export class PostsModule {}
