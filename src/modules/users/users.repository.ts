import { DrizzleService } from "@drizzle/drizzle.service";
import { usersSchema } from "@drizzle/schemas";
import { BaseUser } from "@modules/users/users.types";
import { Injectable } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";

@Injectable()
export class UsersRepository {
    constructor(private readonly drizzleService: DrizzleService) {}

    async findByUUID(uuid: string, options: { includeDeleted?: boolean} = {}): Promise<Nullable<BaseUser>> {
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

        return result[0] as BaseUser ?? null;
    }

    async findByEmail(email: string, options: { includeDeleted?: boolean} = {}): Promise<Nullable<BaseUser>> {
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

        return result[0] as BaseUser ?? null;
    }

    async findByUsername(username: string, options: { includeDeleted?: boolean} = {}): Promise<Nullable<BaseUser>> {
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

        return result[0] as BaseUser ?? null;
    }

    async findAll(options: { includeDeleted?: boolean} = {}): Promise<BaseUser[]> {
        const { includeDeleted = false } = options;

        const whereClause = includeDeleted
            ? undefined
            : isNull(usersSchema.deletedAt);

        const db = this.drizzleService.getClient();
        const result = await db
            .select()
            .from(usersSchema)
            .where(whereClause);

        return result as BaseUser[];
    }

    async create(data: Omit<BaseUser, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<BaseUser> {
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

    async update(uuid: string, data: Partial<Omit<BaseUser, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<BaseUser> {
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

    async delete(uuid: string, options: { hardDelete?: boolean } = {},): Promise<void> {
        const { hardDelete = false } = options;

        const db = this.drizzleService.getClient();

        if (hardDelete) 
            await db
                .delete(usersSchema)
                .where(eq(usersSchema.uuid, uuid))
        else await db
            .update(usersSchema)
            .set({
                deletedAt: new Date(),
            })
            .where(eq(usersSchema.uuid, uuid));
    }
}