import Redis from "ioredis";

let client: Nullable<Redis> = null;
let redisUrl: Nullable<string> = null;

export default function getRedisClient(url: string): Redis {
    if (!client || redisUrl !== url) {
        if (client) client.disconnect();
        client = new Redis(url);
        redisUrl = url;
    }
    return client as Redis;
}