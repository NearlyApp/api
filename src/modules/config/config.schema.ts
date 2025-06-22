import { z } from "zod";

const configSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    PG_HOST: z.string().default("localhost"),
    PG_PORT: z.coerce.number().default(5432),
    PG_USER: z.string(),
    PG_PASSWORD: z.string(),
    DB_NAME: z.string(),
})

export default configSchema;