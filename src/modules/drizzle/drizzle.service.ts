import { ConfigService } from '@config/config.service';
import * as schema from '@drizzle/schemas';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly client: ReturnType<typeof drizzle>;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('PG_HOST'),
      port: this.configService.get('PG_PORT'),
      user: this.configService.get('PG_USER'),
      password: this.configService.get('PG_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      ssl: true,
    });
    this.client = drizzle(this.pool, {
      schema,
    });
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
