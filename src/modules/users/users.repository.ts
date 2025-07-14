import { DrizzleService } from '@drizzle/drizzle.service';
import { BaseUser } from '@nearlyapp/common';
import { usersSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

type FindOptions = {
  withRoles?: boolean;
  includeDeleted?: boolean;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findByUUID(
    uuid: string,
    options: FindOptions = {},
  ): Promise<Nullable<BaseUser>> {
    const { includeDeleted = false } = options;

    const whereClause = includeDeleted
      ? eq(usersSchema.uuid, uuid)
      : and(eq(usersSchema.uuid, uuid), isNull(usersSchema.deletedAt));

    const db = this.drizzleService.getClient();
    const result = await db
      .select()
      .from(usersSchema)
      .where(whereClause)
      .limit(1);

    const user = (result[0] as BaseUser) ?? null;

    return user;
  }

  async findByEmail(
    email: string,
    options: FindOptions = {},
  ): Promise<Nullable<BaseUser>> {
    const { includeDeleted = false } = options;

    const whereClause = includeDeleted
      ? eq(usersSchema.email, email)
      : and(eq(usersSchema.email, email), isNull(usersSchema.deletedAt));

    const db = this.drizzleService.getClient();
    const result = await db
      .select()
      .from(usersSchema)
      .where(whereClause)
      .limit(1);

    const user = (result[0] as BaseUser) ?? null;

    return user;
  }

  async findByUsername(
    username: string,
    options: FindOptions = {},
  ): Promise<Nullable<BaseUser>> {
    const { includeDeleted = false } = options;

    const whereClause = includeDeleted
      ? eq(usersSchema.username, username)
      : and(eq(usersSchema.username, username), isNull(usersSchema.deletedAt));

    const db = this.drizzleService.getClient();
    const result = await db
      .select()
      .from(usersSchema)
      .where(whereClause)
      .limit(1);

    const user = (result[0] as BaseUser) ?? null;

    return user;
  }

  async findAll(options: FindOptions = {}): Promise<BaseUser[]> {
    const { includeDeleted = false } = options;

    const whereClause = includeDeleted
      ? undefined
      : isNull(usersSchema.deletedAt);

    const db = this.drizzleService.getClient();
    const result = await db.select().from(usersSchema).where(whereClause);

    return result as BaseUser[];
  }

  async create(
    data: Omit<BaseUser, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<BaseUser> {
    const db = this.drizzleService.getClient();
    const result = await db
      .insert(usersSchema)
      .values({
        ...data,
        uuid: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0] as BaseUser;
  }

  async update(
    uuid: string,
    data: Partial<
      Omit<BaseUser, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<BaseUser> {
    const db = this.drizzleService.getClient();
    const result = await db
      .update(usersSchema)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.uuid, uuid))
      .returning();

    return result[0] as BaseUser;
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
}
