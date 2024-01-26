// PrivateBank Bot Practive University Work
// Developed by Yaroslav Volkivskyi (TheLaidSon)

// Actual v0.0.4

// Initialization File

import { Telegraf } from "telegraf";
import { createClient } from "redis";
import { MongoClient } from "mongodb";
import { botVersion } from "./sysinfo";

async function connectToMainDB() {
  try {
    const client = new MongoClient('mongodb://localhost:27017/?family=4');

    await client.connect();

    console.log("Done");
    return client;
  } catch (error) {
    console.error('\n\nFatal Error to connect to MongoDB:\n', error);
    process.exit(1);
  }
}

export default async function init() {

  console.log(`\n\n  PrivateBankBot v${botVersion} Practice Edition\n\n   Developed by Yaroslav Volkivskyi (TheLaidSon)\n\n`)
  console.log("Creating redis client...");
  const redis = createClient();
  redis.on("error", (err) => console.log("Redis Client Error", err));
  console.log("Done");

  console.log("Connecting to redis server...");
  await redis.connect();
  console.log("Done");

  console.log("Connecting to mongodb...")
  const bankdb = await connectToMainDB();
  console.log("Done")

  console.log("Creating telegraf bot instanse...");
  //dev
  const bot = new Telegraf("6192445742:AAHSlflbQoeylaqx3hZAh0WkS3fZ1Bt8sdU");
  console.log("Done");

  console.log('\n\n BOT READY TO WORK!\n\n');

  // wrap redis with helper functions
  const wRedis = ({
    getAll: (id: number) => async () => redis.hGetAll(`${id}`),
    get: (id: number) => async (property: string) => await redis.hGet(`${id}`, property),
    set: (id: number) => (property: string) => async (new_value: string) => await redis.hSet(`${id}`, property, new_value)
  })

  return [bot, wRedis, bankdb] as const;
}