import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
export default async () => {
  const counter = await redis.incr("edge_counter");
  return new Response(counter);
};