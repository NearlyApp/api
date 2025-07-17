import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { usersSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { count, eq, isNull } from 'drizzle-orm';

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

  async delete(
    uuid: string,
    options: { hardDelete?: boolean } = {},
  ): Promise<void> {
    const { hardDelete = false } = options;

    const db = this.drizzleService.getClient();

    if (hardDelete)
      await db.delete(usersSchema).where(eq(usersSchema.uuid, uuid));
    else
      await db
        .update(usersSchema)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(usersSchema.uuid, uuid));
  }

  async count(options: FindOptions<true> = {}): Promise<number> {
    const { offset, limit, includeDeleted = false } = options;

    const db = this.drizzleService.getClient();
    let query = db.select({ count: count() }).from(usersSchema).$dynamic();

    if (!includeDeleted) query = query.where(isNull(usersSchema.deletedAt));

    const result = await this.withPagination(query, offset, limit);

    return Number(result[0]?.count ?? 0);
  }
}
