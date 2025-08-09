import {
  DrizzleClient,
  getDrizzleClient,
  getDrizzlePool,
} from '@nearlyapp/common';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly client: DrizzleClient;

  constructor() {
    this.pool = getDrizzlePool();
    this.client = getDrizzleClient();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
