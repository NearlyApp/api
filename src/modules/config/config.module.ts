import configSchema from "@config/config.schema";
import { ConfigService } from "@config/config.service";
import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.production', '.env.development'],
            validate: (config) => {
                const result = configSchema.safeParse(config);
                if (!result.success) throw new Error("Invalid configuration: " + result.error.message);
                return result.data;
            }
        })
    ],
    providers: [ConfigService],
    exports: [ConfigService]
})
export class ConfigModule {}