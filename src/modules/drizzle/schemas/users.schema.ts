import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const usersSchema = pgTable(
  'users',
  {
    uuid: uuid('uuid').primaryKey().defaultRandom(),

    username: text('username').notNull().unique(),
    displayName: text('display_name'),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    avatarUrl: text('avatar_url'),

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
