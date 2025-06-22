import { AuthController } from '@modules/auth/auth.controller';
import { SessionSerializer } from '@modules/auth/session.serializer';
import { LocalStrategy } from '@modules/auth/strategies/local.strategy';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [LocalStrategy, SessionSerializer],
})
export class AuthModule {}
