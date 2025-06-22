import { DrizzleModule } from '@drizzle/drizzle.module';
import { UsersController } from '@modules/users/users.controller';
import { UsersRepository } from '@modules/users/users.repository';
import { UsersService } from '@modules/users/users.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
  imports: [DrizzleModule],
})
export class UsersModule {}
