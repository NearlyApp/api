import { createClient, RedisClientType } from 'redis';

let client: Nullable<RedisClientType> = null;
let redisUrl: Nullable<string> = null;

export default async function getRedisClient(
  url: string,
): Promise<RedisClientType> {
  if (!client || redisUrl !== url) {
    if (client) await client.quit();
    client = createClient({ url });
    await client.connect();
    redisUrl = url;
  }
  return client;
}
