import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as IOServer } from 'socket.io'

const PORT = 3001
const app = express()

// CORS 설정
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174'], 
  credentials: true 
}))

app.get('/health', (_, res) => res.json({ ok: true, timestamp: new Date().toISOString() }))

const server = http.createServer(app)
const io = new IOServer(server, {
  cors: { 
    origin: ['http://localhost:5173', 'http://localhost:5174'], 
    credentials: true 
  }
})

// 간단한 소켓 이벤트 핸들러
io.on('connection', (socket) => {
  console.log('🔌 클라이언트 연결됨:', socket.id)
  
  // createRoom 이벤트 테스트
  socket.on('createRoom', (data) => {
    console.log('🎮 createRoom 이벤트 수신:', data)
    
    // 간단한 응답 생성
    const roomId = `room_${Date.now()}`
    const player = {
      id: `player_${Date.now()}`,
      name: data.playerName,
      color: data.color,
      cash: 1500000,
      position: 0
    }
    
    console.log('✅ 방 생성 응답 전송:', { roomId, player })
    socket.emit('roomCreated', { roomId, player })
  })
  
  socket.on('disconnect', () => {
    console.log('❌ 클라이언트 연결 해제:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`🚀 테스트 서버 시작: http://localhost:${PORT}`)
})