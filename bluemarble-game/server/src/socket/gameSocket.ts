import type { Server, Socket } from 'socket.io'
import { randomUUID } from 'crypto'
import { GameEngine } from '../services/GameEngine'

const engine = new GameEngine()

export function registerGameSocket(io: Server) {
  console.log('[gameSocket] 게임 소켓 등록됨')
  io.on('connection', (socket: Socket) => {
    console.log('[gameSocket] 클라이언트 연결됨:', socket.id)
    
    // 방 생성
    socket.on('createRoom', ({ roomName, playerName, color }) => {
      console.log('[gameSocket] createRoom 이벤트 수신:', { roomName, playerName, color })
      const { roomId, player } = engine.createRoom({ roomName, playerName, color })
      console.log('[gameSocket] 방 생성 완료:', { roomId, player })
      socket.join(roomId)
      socket.emit('roomCreated', { roomId, room: engine.getRoom(roomId), player })
      io.to(roomId).emit('playerJoined', { player, room: engine.getRoom(roomId) })
    })

    // 방 입장
    socket.on('joinRoom', ({ roomId, playerName, color }) => {
      const result = engine.joinRoom({ roomId, playerName, color })
      if (!result.ok) {
        socket.emit('error', { message: result.message })
        return
      }
      socket.join(roomId)
      socket.emit('joinSuccess', { roomId, player: result.player, room: engine.getRoom(roomId) })
      io.to(roomId).emit('playerJoined', { player: result.player, room: engine.getRoom(roomId) })
    })

    // 게임 시작 (방장만)
    socket.on('startGame', ({ roomId }) => {
      const started = engine.startGame(roomId)
      if (!started.ok) {
        socket.emit('error', { message: started.message })
        return
      }
      io.to(roomId).emit('gameStarted', { gameState: started.state })
    })

    // 주사위
    socket.on('rollDice', ({ roomId }) => {
      const rolled = engine.rollDice(roomId)
      if (!rolled.ok) {
        socket.emit('error', { message: rolled.message })
        return
      }
      io.to(roomId).emit('diceRolled', { playerId: rolled.playerId, dice: rolled.dice, isDouble: rolled.isDouble })
      io.to(roomId).emit('gameStateUpdate', { gameState: rolled.state })
    })

    // 땅 구매
    socket.on('buyProperty', ({ roomId, propertyId }) => {
      const res = engine.buyProperty(roomId, propertyId)
      if (!res.ok) {
        socket.emit('error', { message: res.message })
        return
      }
      io.to(roomId).emit('propertyBought', { playerId: res.playerId, property: res.property })
      io.to(roomId).emit('gameStateUpdate', { gameState: res.state })
    })

    // 건물 건설
    socket.on('buildBuilding', ({ roomId, propertyId, type }) => {
      const res = engine.buildBuilding(roomId, propertyId, type)
      if (!res.ok) {
        socket.emit('error', { message: res.message })
        return
      }
      io.to(roomId).emit('buildingBuilt', { playerId: res.playerId, property: res.property })
      io.to(roomId).emit('gameStateUpdate', { gameState: res.state })
    })

    // 턴 종료
    socket.on('endTurn', ({ roomId }) => {
      const res = engine.endTurn(roomId)
      if (!res.ok) {
        socket.emit('error', { message: res.message })
        return
      }
      io.to(roomId).emit('turnEnded', { playerId: res.prevPlayerId, nextPlayerId: res.nextPlayerId })
      io.to(roomId).emit('gameStateUpdate', { gameState: res.state })
    })

    // 거래 제안
    socket.on('proposeTrade', ({ roomId, toPlayerId, fromCash, toCash, fromProperties, toProperties }: {
      roomId: string
      toPlayerId: string
      fromCash: number
      toCash: number
      fromProperties: number[]
      toProperties: number[]
    }) => {
      const fromPlayerId = socket.data.playerId // 추후 연결 시 설정 필요
      const result = engine.proposeTrade(roomId, fromPlayerId, toPlayerId, fromCash, toCash, fromProperties, toProperties)
      if (result.ok) {
        io.to(roomId).emit('tradeProposed', { offer: result.offer })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // 거래 수락
    socket.on('acceptTrade', ({ roomId, tradeId }: { roomId: string; tradeId: string }) => {
      const result = engine.acceptTrade(roomId, tradeId)
      if (result.ok) {
        io.to(roomId).emit('gameStateUpdate', { gameState: result.state })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // 거래 거절
    socket.on('rejectTrade', ({ roomId, tradeId }: { roomId: string; tradeId: string }) => {
      const result = engine.rejectTrade(roomId, tradeId)
      if (result.ok) {
        io.to(roomId).emit('tradeRejected', { tradeId })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // 건물 매각
    socket.on('sellBuilding', ({ roomId, playerId, propertyId }: { roomId: string; playerId: string; propertyId: number }) => {
      const result = engine.sellBuilding(roomId, playerId, propertyId)
      if (result.ok) {
        io.to(roomId).emit('gameStateUpdate', { gameState: result.state })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // 부동산 매각
    socket.on('sellProperty', ({ roomId, playerId, propertyId }: { roomId: string; playerId: string; propertyId: number }) => {
      const result = engine.sellProperty(roomId, playerId, propertyId)
      if (result.ok) {
        io.to(roomId).emit('gameStateUpdate', { gameState: result.state })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // AI 플레이어 추가
    socket.on('addAIPlayer', ({ roomId, difficulty }: { roomId: string; difficulty: 'easy' | 'normal' | 'hard' }) => {
      const result = engine.addAIPlayer(roomId, difficulty)
      if (result.ok) {
        io.to(roomId).emit('playerJoined', { player: result.player, room: engine.getRoom(roomId) })
      } else {
        socket.emit('error', { message: result.message })
      }
    })

    // AI 턴 실행
    socket.on('executeAITurn', ({ roomId, aiPlayerId }: { roomId: string; aiPlayerId: string }) => {
      const result = engine.executeAITurn(roomId, aiPlayerId)
      if (result.ok && result.state) {
        io.to(roomId).emit('aiTurnExecuted', { actions: result.actions, state: result.state })
      }
    })

    // 게임 저장
    socket.on('saveGame', async ({ roomId }: { roomId: string }) => {
      const result = await engine.saveGameState(roomId)
      if (result.ok) {
        socket.emit('gameSaved', { message: '게임이 저장되었습니다' })
      } else {
        socket.emit('error', { message: result.message || '저장 실패' })
      }
    })

    // 게임 로드
    socket.on('loadGame', async ({ roomId }: { roomId: string }) => {
      const result = await engine.loadGameState(roomId)
      if (result.ok && result.state) {
        io.to(roomId).emit('gameStateUpdate', { gameState: result.state })
        socket.emit('gameLoaded', { message: '게임이 복원되었습니다' })
      } else {
        socket.emit('error', { message: result.message || '로드 실패' })
      }
    })

    // 게임 종료
    socket.on('endGame', async ({ roomId }: { roomId: string }) => {
      const result = await engine.endGame(roomId)
      if (result.ok) {
        io.to(roomId).emit('gameEnded', {})
      }
    })

    // 재접속 처리
    socket.on('reconnect', async ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const result = await engine.handleReconnect(roomId, playerId)
      if (result.ok && result.state) {
        socket.join(roomId)
        socket.emit('gameStateUpdate', { gameState: result.state })
        socket.emit('reconnected', { message: '게임에 재접속되었습니다' })
        io.to(roomId).emit('playerReconnected', { playerId })
      } else {
        socket.emit('error', { message: result.message || '재접속 실패' })
      }
    })

    // 연결 해제 처리 (일시적 연결 끊김 대비)
    socket.on('disconnect', () => {
      console.log('클라이언트 연결 해제:', socket.id)
      // 플레이어 정보는 유지하고 소켓만 해제
      // 재접속 시 handleReconnect에서 복원
    })

    // 채팅 메시지 전송
    socket.on('sendChatMessage', async ({ roomId, playerId, playerName, message }: { 
      roomId: string; 
      playerId: string; 
      playerName: string; 
      message: string 
    }) => {
      const ChatMessage = (await import('../models/ChatMessage')).ChatMessage
      
      try {
        const chatMsg = await ChatMessage.create({
          roomId,
          playerId,
          playerName,
          message,
          timestamp: new Date()
        })

        io.to(roomId).emit('chatMessage', {
          id: chatMsg._id,
          playerId,
          playerName,
          message,
          timestamp: chatMsg.timestamp
        })
      } catch (error) {
        console.error('채팅 메시지 저장 실패:', error)
      }
    })

    // 채팅 내역 로드
    socket.on('loadChatHistory', async ({ roomId }: { roomId: string }) => {
      const ChatMessage = (await import('../models/ChatMessage')).ChatMessage
      
      try {
        const messages = await ChatMessage.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(100) // 최근 100개만
          .lean()

        socket.emit('chatHistory', { messages })
      } catch (error) {
        console.error('채팅 내역 로드 실패:', error)
      }
    })

    // 관전자로 입장
    socket.on('joinAsSpectator', ({ roomId, spectatorName }: { roomId: string; spectatorName: string }) => {
      const room = engine.getRoom(roomId)
      if (!room) {
        socket.emit('error', { message: '방을 찾을 수 없습니다' })
        return
      }

      const spectator: any = {
        id: randomUUID(),
        name: spectatorName,
        isSpectator: true
      }

      socket.join(roomId)
      io.to(roomId).emit('spectatorJoined', { spectator })
      socket.emit('gameStateUpdate', { gameState: room.state })
      socket.emit('joinedAsSpectator', { message: '관전 모드로 입장했습니다' })
    })
  })
}
