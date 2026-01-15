import {
  BaseRepository,
  FindOptions,
  WhereClause,
} from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { PostEntity } from '@nearlyapp/common';
import { postsSchema, usersSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { and, eq, isNull, sql, SQLWrapper } from 'drizzle-orm';

@Injectable()
export class PostsRepository extends BaseRepository<typeof postsSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, postsSchema);
  }

  /**
   * @description Override {@link BaseRepository.findOne} to add the ability to fetch the author of the post.
   * @override {@link BaseRepository.findOne}
   */
  async findOne<WithAuthor extends boolean = false>(
    where: WhereClause<PostEntity>,
    options: FindOptions<false, { withAuthor?: WithAuthor }> = {},
  ): Promise<Nullable<PostEntity<WithAuthor>>> {
    const { includeDeleted = false, withAuthor = false } = options;

    const conditions = this.buildConditions(where);
    if (!includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt'] as SQLWrapper));

    const query = this.db
      .select()
      .from(this.schema)
      .where(and(...conditions))
      .limit(1);

    if (withAuthor) {
      query
        .leftJoin(usersSchema, eq(postsSchema.authorUuid, usersSchema.uuid))
        .as('author');
    }

    const result = await query;

    return (result[0] as Optional<PostEntity<WithAuthor>>) ?? null;
  }

  /**
   * @description Override {@link BaseRepository.findMany} to add the ability to fetch the author of the posts.
   * @override {@link BaseRepository.findMany}
   */
  async findMany<WithAuthor extends boolean = false>(
    where: WhereClause<PostEntity>,
    options: FindOptions<true, { withAuthor?: WithAuthor }> = {},
  ): Promise<PostEntity<WithAuthor>[]> {
    const {
      offset,
      limit,
      includeDeleted = false,
      withAuthor = false,
    } = options;

    let query = this.db.select().from(this.schema).$dynamic();

    const conditions = this.buildConditions(where);
    if (!includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt'] as SQLWrapper));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (withAuthor) {
      query
        .leftJoin(usersSchema, eq(postsSchema.authorUuid, usersSchema.uuid))
        .as('author');
    }

    const result = await this.withPagination(query, offset, limit);

    console.log(
      '[PostsRepository.findMany] Raw result:',
      JSON.stringify(result, null, 2),
    );

    return result as PostEntity<WithAuthor>[];
  }

  async findByUUID<WithAuthor extends boolean = false>(
    uuid: string,
    options: FindOptions<false, { withAuthor?: WithAuthor }> = {},
  ): Promise<Nullable<PostEntity<WithAuthor>>> {
    return this.findOne({ uuid }, options);
  }

  async findByAuthorUUID<WithAuthor extends boolean = false>(
    authorUuid: string,
    options: FindOptions<true, { withAuthor?: WithAuthor }> = {},
  ): Promise<PostEntity<WithAuthor>[]> {
    return this.findMany({ authorUuid }, options);
  }

  async deleteAll(authorUuid: string, options?: FindOptions) {
    const posts = await this.findByAuthorUUID(authorUuid, options);
    await Promise.all(posts.map((post) => this.delete({ uuid: post.uuid })));
  }

  /**
   * @description Get random posts efficiently using TABLESAMPLE.
   * Falls back to standard RANDOM() if not enough posts are sampled.
   *
   * TABLESAMPLE BERNOULLI samples ~X% of pages which is O(1) vs O(n) for ORDER BY RANDOM()
   */
  async getRandomPosts(
    where: WhereClause<PostEntity>,
    limit: number,
  ): Promise<PostEntity[]> {
    const conditions = this.buildConditions(where);
    if (this.schema['deletedAt']) {
      conditions.push(isNull(this.schema['deletedAt'] as SQLWrapper));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Use TABLESAMPLE for efficient random sampling
    // Sample ~10% of pages, then filter and limit
    // This is much faster than ORDER BY RANDOM() on large tables
    const result = await this.db
      .select()
      .from(sql`${postsSchema} TABLESAMPLE BERNOULLI(10)`)
      .where(whereCondition)
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    // Fallback: if TABLESAMPLE didn't return enough rows, use standard query
    if (result.length < limit) {
      return this.db
        .select()
        .from(postsSchema)
        .where(whereCondition)
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }

    return result as PostEntity[];
  }
}
