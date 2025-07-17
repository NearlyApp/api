import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { usersSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { count, isNull } from 'drizzle-orm';

@Injectable()
export class UsersRepository extends BaseRepository<typeof usersSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, usersSchema);
  }

  async findByUUID(uuid: string, options?: FindOptions) {
    return this.findOne({ uuid }, options);
  }

  async findByEmail(email: string, options?: FindOptions) {
    return this.findOne({ email }, options);
  }

  async findByUsername(username: string, options?: FindOptions) {
    return this.findOne({ username }, options);
  }

  async count(options: FindOptions<false> = {}): Promise<number> {
    const { offset, limit, includeDeleted = false } = options;

    const db = this.drizzleService.getClient();
    let query = db.select({ count: count() }).from(usersSchema).$dynamic();

    if (!includeDeleted) query = query.where(isNull(usersSchema.deletedAt));

    const result = await this.withPagination(query, offset, limit);

    return Number(result[0]?.count ?? 0);
  }
}
