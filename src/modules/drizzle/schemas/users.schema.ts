import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;
export const USERNAME_REGEX = /^[a-zA-Z0-9._\-']+$/;

export const DISPLAY_NAME_MAX_LENGTH = 64;

const usersSchema = pgTable(
  'users',
  {
    uuid: uuid('uuid').primaryKey().defaultRandom(),

    username: varchar('username', { length: USERNAME_MAX_LENGTH })
      .notNull()
      .unique(),
    displayName: varchar('display_name', { length: DISPLAY_NAME_MAX_LENGTH }),
    email: varchar('email', { length: 320 }).notNull().unique(),
    biography: text('biography'),
    password: varchar('password', { length: 128 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 255 }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('users_username_index').on(table.username),
    index('users_display_name_index').on(table.displayName),
    index('users_email_index').on(table.email),
  ],
);

export default usersSchema;
