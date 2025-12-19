import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { BasePost } from '@nearlyapp/common';
import { postsSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class PostsRepository extends BaseRepository<typeof postsSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, postsSchema);
  }

  async findByUUID(uuid: string, options?: FindOptions) {
    return this.findOne({ uuid }, options);
  }

  async findByLocation(lat: number, lng: number, options?: FindOptions) {
    // TODO: Implement location-based search logic
    return this.findMany({ lat, lng }, options);
  }

  async findByAuthorUUID(authorUuid: string, options?: FindOptions) {
    return this.findMany({ authorUuid }, options);
  }

  async deleteAll(authorUuid: string, options?: FindOptions) {
    const posts = await this.findByAuthorUUID(authorUuid, options);
    for (const post of posts) {
      await this.delete({ uuid: post.uuid });
    }
  }

  async getRandomPosts(
    userUuid: Nullable<string>,
    limit: number,
  ): Promise<BasePost[]> {
    const where = userUuid
      ? and(
          eq(postsSchema.status, 'PROCESSED'),
          eq(postsSchema.authorUuid, userUuid),
        )
      : eq(postsSchema.status, 'PROCESSED');

    return this.db
      .select()
      .from(postsSchema)
      .where(where)
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }
}
