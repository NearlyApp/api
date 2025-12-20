import { DrizzleModule } from '@drizzle/drizzle.module';
import { UsersController } from '@modules/users/users.controller';
import { UsersRepository } from '@modules/users/users.repository';
import { UsersService } from '@modules/users/users.service';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '@posts/posts.module';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
  imports: [DrizzleModule, forwardRef(() => PostsModule)],
})
export class UsersModule {}
