import { RootModule } from '@modules/root/root.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [RootModule],
})
export class AppModule {}
