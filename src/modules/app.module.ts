import { ConfigModule } from '@config/config.module';
import { AppController } from '@modules/app.controller';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';

@Module({
    controllers: [AppController],
    imports: [ConfigModule, UsersModule]
})
export class AppModule {}
