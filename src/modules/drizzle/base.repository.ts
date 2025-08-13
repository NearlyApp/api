// @ts-nocheck

import { DrizzleService } from '@drizzle/drizzle.service';
import {
  and,
  count,
  eq,
  InferSelectModel,
  isNull,
  SQL,
  SQLWrapper,
} from 'drizzle-orm';
import { PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';

type WhereValue<T> = T | SQL | SQLWrapper;
type WhereClause<TEntity> = Partial<{
  [K in keyof TEntity]: WhereValue<TEntity[K]>;
}>;

export type FindOptions<
  WithPagination extends boolean = false,
  Extra extends object = object,
> = { includeDeleted?: boolean } & Extra &
  (WithPagination extends true ? { offset?: number; limit?: number } : object);

type DataExcludedKeys = 'id' | 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt';

export abstract class BaseRepository<
  TSchema extends PgTable<TableConfig>,
  TEntity extends InferSelectModel<TSchema> = InferSelectModel<TSchema>,
> {
  constructor(
    protected readonly drizzleService: DrizzleService,
    protected readonly schema: TSchema,
  ) {}

  protected get db() {
    return this.drizzleService.client;
  }

  async findOne(
    where: WhereClause<TEntity>,
    options: FindOptions = {},
  ): Promise<Nullable<TEntity>> {
    const { includeDeleted = false } = options;

    const conditions = this.buildConditions(where);
    if (!includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt'] as SQL));

    const query = this.db
      .select()
      .from(this.schema)
      .where(and(...conditions))
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
              isNull(this.schema['deletedAt'] as SQL),
            ),
      )
      .limit(1);

    const result = await query;

    return (result[0] as TEntity) ?? null;
  }

  async findMany(
    where?: Nullable<WhereClause<TEntity>>,
    options: FindOptions<true> = {},
  ): Promise<TEntity[]> {
    const { offset, limit, includeDeleted = false } = options;

    let query = this.db.select().from(this.schema).$dynamic();

    const conditions = this.buildConditions(where);
    if (!includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt'] as SQL));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await this.withPagination(query, offset, limit);

    return result as TEntity[];
  }

  async create(
    data: Omit<Partial<TEntity>, DataExcludedKeys>,
  ): Promise<TEntity> {
    const result = await this.db.insert(this.schema).values(data).returning();

    return result[0] as TEntity;
  }

  async update(
    where: WhereClause<TEntity>,
    data: Omit<Partial<TEntity>, DataExcludedKeys>,
  ) {
    const _data: Partial<TEntity> = { ...data } as Partial<TEntity>;
    if (this.schema['updatedAt'])
      (_data as Partial<TEntity> & { updatedAt: Date }).updatedAt = new Date();

    const result = await this.db
      .update(this.schema)
      .set(_data)
      .where(and(...this.buildConditions(where)))
      .returning();

    return result;
  }

  async delete(
    where: WhereClause<TEntity>,
    options: { hardDelete?: boolean } = {},
  ) {
    const { hardDelete = false } = options;

    const conditions = this.buildConditions(where);

    if (hardDelete || !this.schema['deletedAt'])
      await this.db.delete(this.schema).where(and(...conditions));
    else {
      await this.db
        .update(this.schema)
        .set({ deletedAt: new Date() })
        .where(and(...conditions));
    }
  }

  async count(
    where?: Nullable<WhereClause<TEntity>>,
    options: FindOptions<false> = {},
  ): Promise<number> {
    const { includeDeleted = false } = options;
    const query = this.db
      .select({ count: count() })
      .from(this.schema)
      .$dynamic();

    const conditions = this.buildConditions(where);
    if (!includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt'] as SQL));

    const result = await query.where(and(...conditions));

    return result[0].count ?? 0;
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

  protected buildConditions(where: Nullish<WhereClause<TEntity>>) {
    const conditions: (SQL | SQLWrapper)[] = [];
    if (where)
      conditions.push(
        ...Object.entries(where).map(([key, value]) => {
          if (
            typeof value === 'object' &&
            value !== null &&
            ('toSQL' in value || 'getSQL' in value)
          ) {
            return value as SQL | SQLWrapper;
          }
          return eq(this.schema[key], value);
        }),
      );
    return conditions;
  }

  getPaginationParams(
    query: { page?: number; limit?: number },
    maxDataPerPage: number,
  ): {
    limit: number;
    offset: number;
  } {
    const limit = Math.min(query.limit ?? maxDataPerPage, maxDataPerPage);
    const offset = query.page ? (query.page - 1) * limit : 0;

    return { limit, offset };
  }
}
