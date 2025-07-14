import { DrizzleService } from '@drizzle/drizzle.service';
import { SeedModule } from '@drizzle/seed.module';
// import rolesSeed from '@drizzle/seeds/roles.seed';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const logger = new Logger('Seed');
  const drizzleService = app.get(DrizzleService);
  const client = drizzleService.getClient();

  try {
    logger.log('🌱 Running seeders...');

    // await rolesSeed(client);

    logger.log('✅ Seeding completed.');
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
