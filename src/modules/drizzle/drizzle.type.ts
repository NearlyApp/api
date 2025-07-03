import { drizzle } from 'drizzle-orm/node-postgres';

export type DrizzleClient = ReturnType<typeof drizzle>;

export type SeedFunction = (client: DrizzleClient) => Promise<void>;
