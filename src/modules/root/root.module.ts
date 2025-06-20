import { RootController } from "@modules/root/root.controller";
import { Module } from "@nestjs/common";

@Module({
    controllers: [RootController],
})
export class RootModule {}