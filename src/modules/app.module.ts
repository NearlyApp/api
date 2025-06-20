import { AppController } from '@modules/app.controller';
import { Module } from '@nestjs/common';

@Module({
    controllers: [AppController]
})
export class AppModule {}
