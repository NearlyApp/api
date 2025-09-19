import { DrizzleModule } from '@drizzle/drizzle.module';
import { S3Module } from '@modules/s3/s3.module';
import { UsersController } from '@modules/users/users.controller';
import { UsersRepository } from '@modules/users/users.repository';
import { UsersService } from '@modules/users/users.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
  imports: [DrizzleModule, S3Module],
})
export class UsersModule {}
