import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { BasePost } from '@nearlyapp/common';
import { postsSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { eq, SQL, sql } from 'drizzle-orm';

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

  // Seed for random posts
  async getRandomPosts(
    userUuid: Nullable<string>,
    limit: number,
  ): Promise<BasePost[]> {
    const where = userUuid
      ? (
          eq(postsSchema.status, 'PROCESSED') as SQL<BasePost> & {
            and: (clause: SQL<BasePost>) => SQL<BasePost>;
          }
        ).and(eq(postsSchema.authorUuid, userUuid) as SQL<BasePost>)
      : (eq(postsSchema.status, 'PROCESSED') as SQL<BasePost>);

    return this.db
      .select()
      .from(postsSchema)
      .where(where)
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }
}
