import { ConfigService } from '@config/config.service';
import { DrizzleClient } from '@drizzle/drizzle.type';
import { getDrizzleClient, getDrizzlePool } from '@nearlyapp/common';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PgSelect } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly client: DrizzleClient;

  constructor(private readonly configService: ConfigService) {
    this.pool = getDrizzlePool();
    this.client = getDrizzleClient();
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
