const redis = require('redis')

const port = 6379
const host = '127.0.0.1'

const client = redis.createClient(port, host)

client.on('connect', () => {
  console.log('Redis client connected')
})

client.on('error', (error) => {
  console.log('Something went wrong ' + err)
})

module.exports = client