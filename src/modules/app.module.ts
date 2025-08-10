import { AuthModule } from '@auth/auth.module';
import { ConfigModule } from '@config/config.module';
import { AppController } from '@modules/app.controller';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';

@Module({
  controllers: [AppController],
  imports: [ConfigModule, UsersModule, AuthModule, PostsModule],
})
export class AppModule {}
