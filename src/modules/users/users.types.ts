import { usersSchema } from '@drizzle/schemas';
import { InferSelectModel } from 'drizzle-orm';

export type BaseUser = InferSelectModel<typeof usersSchema>;

export type User = Omit<BaseUser, 'password'>;
