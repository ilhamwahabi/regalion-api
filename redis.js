const redis = require("redis");
const url = require("url");

const redisUrl = url.parse(process.env.REDIS_URL);

const port = redisUrl.port || 6379;
const host = redisUrl.hostname || "127.0.0.1";

const client = redis.createClient(port, host, { no_ready_check: true });
client.auth(redisUrl.auth.split(":")[1]);

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", error => {
  console.log("Something went wrong " + error);
});

module.exports = client;
