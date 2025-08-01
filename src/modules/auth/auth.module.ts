import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { SessionSerializer } from '@auth/session.serializer';
import { LocalStrategy } from '@auth/strategies/local.strategy';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [LocalStrategy, SessionSerializer, AuthService],
})
export class AuthModule {}
