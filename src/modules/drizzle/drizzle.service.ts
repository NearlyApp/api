import { ConfigService } from '@config/config.service';
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

  constructor(private readonly configService: ConfigService) {
    this.pool = getDrizzlePool();
    this.client = getDrizzleClient();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
