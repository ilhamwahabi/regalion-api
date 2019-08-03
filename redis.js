const redis = require("redis");
const url = require("url");
const dotenv = require("dotenv");

dotenv.config();

const redisUrl = url.parse(process.env.REDIS_URL);

const port = redisUrl.port;
const host = redisUrl.hostname;

const client = redis.createClient(port, host, { no_ready_check: true });
client.auth(redisUrl.auth.split(":")[1]);

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", error => {
  console.log("Something went wrong " + error);
});

module.exports = client;
