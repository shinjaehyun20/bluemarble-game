import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as IOServer } from 'socket.io'
import { registerGameSocket } from './socket/gameSocket'

const PORT = 3001
const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }))
app.get('/health', (_, res) => res.json({ ok: true }))

const server = http.createServer(app)
const io = new IOServer(server, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }
})

registerGameSocket(io)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
