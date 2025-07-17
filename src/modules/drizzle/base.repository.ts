// @ts-nocheck

import { DrizzleService } from '@drizzle/drizzle.service';
import { and, eq, InferSelectModel, isNull } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

export type FindOptions<
  WithPagination extends boolean = false,
  Extra extends object = object,
> = { includeDeleted?: boolean } & Extra &
  (WithPagination extends true ? { offset?: number; limit?: number } : object);

type DataExcludedKeys = 'id' | 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt';

export abstract class BaseRepository<
  TSchema extends PgTable,
  TEntity extends InferSelectModel<TSchema> = InferSelectModel<TSchema>,
> {
  constructor(
    protected readonly drizzleService: DrizzleService,
    protected readonly schema: TSchema,
  ) {}

  protected get db() {
    return this.drizzleService.getClient();
  }

  async findOne(
    where: Partial<TEntity>,
    options: FindOptions = {},
  ): Promise<Nullable<TEntity>> {
    const { includeDeleted = false } = options;

    const query = this.db
      .select()
      .from(this.schema)
      .where(
        includeDeleted && this.schema['deletedAt']
          ? eq(this.schema, where)
          : and(eq(this.schema, where), isNull(this.schema['deletedAt'])),
      )
      .limit(1);

    const result = await query;

    return (result[0] as TEntity) ?? null;
  }

  /**
   * @deprecated
   */
  async findBy<K extends keyof TEntity>(
    field: K,
    value: TEntity[K],
    options: FindOptions = {},
  ): Promise<Nullable<TEntity>> {
    const { includeDeleted = false } = options;

    const query = this.db
      .select()
      .from(this.schema)
      .where(
        includeDeleted && this.schema['deletedAt']
          ? eq(this.schema[field], value)
          : and(
              eq(this.schema[field], value),
              isNull(this.schema['deletedAt']),
            ),
      )
      .limit(1);

    const result = await query;

    return (result[0] as TEntity) ?? null;
  }

  async findMany(options: FindOptions<true> = {}): Promise<TEntity[]> {
    const { offset, limit, includeDeleted = false } = options;

    let query = this.db.select().from(this.schema).$dynamic();

    if (!includeDeleted && this.schema['deletedAt'])
      query = query.where(isNull(this.schema['deletedAt']));

    const result = await this.withPagination(query, offset, limit);

    return result as TEntity[];
  }

  async create(
    data: Omit<Partial<TEntity>, DataExcludedKeys>,
  ): Promise<TEntity> {
    if (this.schema['uuid']) data.uuid = crypto.randomUUID();
    if (this.schema['createdAt']) data.createdAt = new Date();
    if (this.schema['updatedAt']) data.updatedAt = new Date();

    const result = await this.db.insert(this.schema).values(data).returning();

    return result[0] as TEntity;
  }

  async update(
    where: Partial<TEntity>,
    data: Omit<Partial<TEntity>, DataExcludedKeys>,
  ): Promise<TEntity> {
    if (this.schema['updatedAt']) data.updatedAt = new Date();

    const result = await this.db
      .update(this.schema)
      .set(data)
      .where(eq(this.schema, where))
      .returning();

    return result[0] as TEntity;
  }

  protected withPagination<T extends PgSelect>(
    qb: T,
    offset: number = 0,
    limit?: number,
  ): T {
    let query = qb.offset(offset);

    if (limit && limit > 0) query = query.limit(limit);

    return query;
  }
}
