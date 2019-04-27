const redis = require('redis')

const port = process.env.REDIS_PORT || 6379
const host = process.env.REDIS_HOST || '127.0.0.1'

const client = redis.createClient(port, host)

client.on('connect', () => {
  console.log('Redis client connected')
})

client.on('error', (error) => {
  console.log('Something went wrong ' + error)
})

module.exports = client