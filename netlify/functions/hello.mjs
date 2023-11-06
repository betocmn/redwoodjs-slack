import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
export default async () => {
  console.log(process.env.SLACK_BOT_TOKEN);
  const counter = await redis.incr("edge_counter");
  return new Response(counter);
};