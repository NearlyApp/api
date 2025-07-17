// @ts-nocheck

import { DrizzleService } from '@drizzle/drizzle.service';
import {
  and,
  eq,
  InferSelectModel,
  isNull,
  SQL,
  SQLWrapper,
} from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

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
  TSchema extends PgTable,
  TEntity extends InferSelectModel<TSchema> = InferSelectModel<TSchema>,
> {
  constructor(
    protected readonly drizzleService: DrizzleService,
    protected readonly schema: TSchema,
  ) {}

  protected get db() {
    return this.drizzleService.client;
  }

  protected buildConditions(
    where: Nullable<WhereClause<TEntity>>,
    includeDeleted: boolean,
  ) {
    const conditions = [];
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
    if (includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt']));
    return conditions;
  }

  async findOne(
    where: WhereClause<TEntity>,
    options: FindOptions = {},
  ): Promise<Nullable<TEntity>> {
    const { includeDeleted = false } = options;

    const conditions = Object.entries(where).map(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        ('toSQL' in value || 'getSQL' in value)
      ) {
        return value as SQL | SQLWrapper;
      }
      return eq(this.schema[key], value);
    });

    if (includeDeleted && this.schema['deletedAt'])
      conditions.push(isNull(this.schema['deletedAt']));

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
              isNull(this.schema['deletedAt']),
            ),
      )
      .limit(1);

    const result = await query;

    return (result[0] as TEntity) ?? null;
  }

  async findMany(
    where: Nullable<WhereClause<TEntity>>,
    options: FindOptions<true> = {},
  ): Promise<TEntity[]> {
    const { offset, limit, includeDeleted = false } = options;

    let query = this.db.select().from(this.schema).$dynamic();

    const conditions = this.buildConditions(where, includeDeleted);
    query = query.where(and(...conditions));

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
    where: WhereClause<TEntity>,
    data: Omit<Partial<TEntity>, DataExcludedKeys>,
  ) {
    if (this.schema['updatedAt']) data.updatedAt = new Date();

    const conditions = Object.entries(where).map(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        ('toSQL' in value || 'getSQL' in value)
      ) {
        return value as SQL | SQLWrapper;
      }
      return eq(this.schema[key], value);
    });

    const result = await this.db
      .update(this.schema)
      .set(data)
      .where(and(...conditions))
      .returning();

    return result;
  }

  async delete(
    where: WhereClause<TEntity>,
    options: { hardDelete?: boolean } = {},
  ) {
    const { hardDelete = false } = options;

    const conditions = Object.entries(where).map(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        ('toSQL' in value || 'getSQL' in value)
      ) {
        return value as SQL | SQLWrapper;
      }
      return eq(this.schema[key], value);
    });

    if (hardDelete || !this.schema['deletedAt'])
      await this.db.delete(this.schema).where(and(...conditions));
    else await this.update(where, { deletedAt: new Date() });
  }

  async count(
    where?: Nullable<WhereClause<TEntity>> = null,
    options: FindOptions<false> = {},
  ): Promise<number> {
    const { offset, limit, includeDeleted = false } = options;
    const query = this.db
      .select({ count: this.count() })
      .from(this.schema)
      .$dynamic();

    const conditions = this.buildConditions(where, includeDeleted);
    return query.where(and(...conditions)).count ?? 0;
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
