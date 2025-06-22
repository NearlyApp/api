import dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

const SCHEMAS_PATH = './src/modules/drizzle/schemas';
const MIGRATIONS_PATH = './src/modules/drizzle/migrations';

const drizzleConfig: Config = {
  schema: SCHEMAS_PATH,
  out: MIGRATIONS_PATH,
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || '',
    password: process.env.PG_PASSWORD || '',
    database: process.env.DB_NAME || '',
    ssl: true,
  },
};

export default drizzleConfig;
