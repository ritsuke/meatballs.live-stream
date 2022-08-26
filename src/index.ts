import 'dotenv/config'

import fastify from 'fastify'
import fastifySocketIOPlugin from 'fastify-socket.io'
import redis from 'redis'

if (!process.env.SERVER_PORT) throw 'missing port; check env'
if (!process.env.REDIS_DB_URL) throw 'missing redis db url; check env'

const HOST = '0.0.0.0',
  PORT = parseInt(process.env.SERVER_PORT),
  COMMENT_STREAM_CHANNEL_NAME = 'MEATBALLS:COMMENT_STREAM'

const redisClient = redis.createClient({ url: process.env.REDIS_DB_URL })

const app = fastify()

app.register(fastifySocketIOPlugin, {
  cors: { origin: 'http://localhost:3000', methods: ['GET'] }
})

app.get('/', (_, res) => {
  res.header('content-type', 'text/html; charset=utf-8')

  res
    .status(200)
    .send('<html><a href="https://meatballs.live">meatballs.live</a></html>')
})

app.ready(async (error) => {
  if (error) throw error

  await redisClient.connect()

  console.info(`[KODAMA] ready; listening on port ${PORT}`)

  redisClient.subscribe(COMMENT_STREAM_CHANNEL_NAME, (message: string) => {
    app.io.emit(COMMENT_STREAM_CHANNEL_NAME, message)
  })

  app.io.on('connection', (socket: any) => {
    console.info(`${socket.id} connected...`)

    socket.on('disconnect', () => {
      console.info(`${socket.id} disconnected...`)
    })
  })
})

app.listen({
  host: HOST,
  port: PORT
})
