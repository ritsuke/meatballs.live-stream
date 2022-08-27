import 'dotenv/config'

import fastify from 'fastify'
import fastifySocketIOPlugin from 'fastify-socket.io'
import redis from 'redis'
import type { Socket } from 'socket.io'

if (!process.env.PORT) throw 'missing port; check env'
if (!process.env.REDIS_DB_URL) throw 'missing redis db url; check env'

const HOST = '0.0.0.0',
  PORT = parseInt(process.env.PORT),
  PRESENCE_STREAM_CHANNEL_KEY = 'MEATBALLS:PRESENCE_STREAM',
  COMMENT_STREAM_CHANNEL_KEY = 'MEATBALLS:COMMENT_STREAM',
  FRONTPAGE_STREAM_CHANNEL_KEY = 'MEATBALLS:FRONTPAGE_STREAM'

const redisPubClient = redis.createClient({ url: process.env.REDIS_DB_URL }),
  redisSubClient = redis.createClient({ url: process.env.REDIS_DB_URL })

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

  await Promise.all([redisPubClient.connect(), redisSubClient.connect()])

  console.info(`[KODAMA] ready; listening on port ${PORT}`)

  redisSubClient.subscribe(PRESENCE_STREAM_CHANNEL_KEY, (message: string) => {
    console.info(`[KODAMA:${PRESENCE_STREAM_CHANNEL_KEY}]: ${message}`)

    app.io.emit(PRESENCE_STREAM_CHANNEL_KEY, message)
  })

  redisSubClient.subscribe(COMMENT_STREAM_CHANNEL_KEY, (message: string) => {
    console.info(`[KODAMA:${COMMENT_STREAM_CHANNEL_KEY}]: ${message}`)

    app.io.emit(COMMENT_STREAM_CHANNEL_KEY, message)
  })

  redisSubClient.subscribe(FRONTPAGE_STREAM_CHANNEL_KEY, (message: string) => {
    console.info(`[KODAMA:${FRONTPAGE_STREAM_CHANNEL_KEY}]: ${message}`)

    app.io.emit(FRONTPAGE_STREAM_CHANNEL_KEY, message)
  })

  app.io.on('connection', (socket: Socket) => {
    console.info(`[KODAMA:connect]: ${socket.id}`)

    redisPubClient.publish(
      PRESENCE_STREAM_CHANNEL_KEY,
      `{ "users": ${app.io.engine.clientsCount as number} }`
    )

    socket.on('disconnect', () => {
      redisPubClient.publish(
        PRESENCE_STREAM_CHANNEL_KEY,
        `{ "users": ${app.io.engine.clientsCount as number} }`
      )

      console.info(`[KODAMA:disconnect]: ${socket.id}`)
    })
  })
})

app.listen({
  host: HOST,
  port: PORT
})
