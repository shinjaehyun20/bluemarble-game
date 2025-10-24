import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import { Server as IOServer } from 'socket.io'
import { registerGameSocket } from './socket/gameSocket'

console.log('[server] Starting...')

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemarble'
const CORS_ORIGINS = (process.env.CORS_ORIGINS ? JSON.parse(process.env.CORS_ORIGINS) : ['http://localhost:5173']) as string[]

console.log('[server] PORT:', PORT)
console.log('[server] CORS_ORIGINS:', CORS_ORIGINS)

async function main() {
  console.log('[server] main() called')
  // MongoDB 연결 시도 (실패해도 계속 진행)
  let mongoConnected = false
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('[server] MongoDB connected')
    mongoConnected = true
  } catch (e) {
    console.log('[server] MongoDB connection failed - running without DB')
  }

  const app = express()
  app.use(express.json())
  app.use(cors({ origin: CORS_ORIGINS, credentials: true }))

  // MongoDB 연결 성공 시에만 MongoStore 사용
  const sessConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  }
  
  if (mongoConnected) {
    sessConfig.store = MongoStore.create({ mongoUrl: MONGODB_URI })
  }
  
  app.use(session(sessConfig))

  // 간단한 상태 체크
  app.get('/health', (_, res) => res.json({ ok: true }))

  const server = http.createServer(app)
  const io = new IOServer(server, {
    cors: { origin: CORS_ORIGINS, credentials: true }
  })

  io.use((socket, next) => {
    // 세션 클라이언트와 공유 (선택적으로 처리)
    next()
  })

  registerGameSocket(io)

  server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`)
  })
}

main().catch((e) => {
  console.error('[server] Fatal error:')
  console.error(e)
  process.exit(1)
})
