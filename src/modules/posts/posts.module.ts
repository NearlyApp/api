import { DrizzleModule } from '@drizzle/drizzle.module';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
  exports: [PostsRepository, PostsService],
  imports: [DrizzleModule, forwardRef(() => UsersModule)],
})
export class PostsModule {}
