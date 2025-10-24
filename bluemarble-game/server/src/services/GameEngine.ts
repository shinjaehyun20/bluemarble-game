import { randomUUID } from 'crypto'
import boardData from '../config/board.json'
import type { Cell, GameState, Player, Property } from './types'
import { TurnManager } from './TurnManager'
import { EventHandler } from './EventHandler'
import { PropertyManager } from './PropertyManager'
import { TradeManager } from './TradeManager'
import { BankruptcyManager } from './BankruptcyManager'
import { AIPlayer, type AIDifficulty } from './AIPlayer'
import { GameSave } from '../models/GameSave'

interface CreateRoomInput { roomName: string, playerName: string, color: string }

export class GameEngine {
  private rooms = new Map<string, {
    id: string
    name: string
    players: Player[]
    state: GameState | null
    doubleCount: Map<string, number>
    deckPointer: number
    eventHandler: EventHandler
    propertyMgr: PropertyManager
    tradeMgr: TradeManager
    bankruptcyMgr: BankruptcyManager
    aiPlayers: Map<string, AIPlayer>
    autoSaveInterval?: ReturnType<typeof setInterval>
  }>()
  turn: TurnManager
  constructor() {
    this.rooms = new Map()
    this.turn = new TurnManager()
  }

  getRoom(roomId: string) { return this.rooms.get(roomId) }

  createRoom({ roomName, playerName, color }: CreateRoomInput) {
    const roomId = randomUUID()
    const player: Player = { id: randomUUID(), name: playerName, color: color as any, cash: 1500000, position: 0 }
    const state: GameState = {
      board: boardData as any as Cell[],
      players: [player],
      currentTurn: player.id,
      turnOrder: [player.id],
      log: []
    }
    this.rooms.set(roomId, { 
      id: roomId, 
      name: roomName, 
      players: [player], 
      state, 
      doubleCount: new Map(),
      deckPointer: 0,
      eventHandler: new EventHandler(),
      propertyMgr: new PropertyManager(),
      tradeMgr: new TradeManager(),
      bankruptcyMgr: new BankruptcyManager(),
      aiPlayers: new Map()
    })
    return { roomId, player }
  }

  joinRoom({ roomId, playerName, color }: { roomId: string, playerName: string, color: string }) {
    const room = this.rooms.get(roomId)
    if (!room) return { ok: false as const, message: '방을 찾을 수 없습니다' }
    if (room.players.length >= 5) return { ok: false as const, message: '정원 초과' }
    const player: Player = { id: randomUUID(), name: playerName, color: color as any, cash: 1500000, position: 0 }
    room.players.push(player)
    room.state!.players.push(player)
    room.state!.turnOrder.push(player.id)
    return { ok: true as const, player }
  }

  startGame(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return { ok: false as const, message: '방이 없습니다' }
    if (!room.state) return { ok: false as const, message: '상태 오류' }
    // 바로 시작: 첫 플레이어부터
    return { ok: true as const, state: room.state }
  }

  rollDice(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const state = room.state
    const current = state.players.find(p => p.id === state.currentTurn)!
    // 무인도 대기 처리
    if (current.inIsland && current.inIsland > 0) {
      current.inIsland -= 1
      state.log.unshift({ timestamp: Date.now(), message: `${current.name} 무인도 대기 (${current.inIsland}턴 남음)` })
      state.currentTurn = this.turn.next(state.turnOrder, state.currentTurn)
      return { ok: true as const, playerId: current.id, dice: [0, 0] as [number, number], isDouble: false, state }
    }

    const d1 = 1 + Math.floor(Math.random() * 6)
    const d2 = 1 + Math.floor(Math.random() * 6)
    const steps = d1 + d2
    let newPos = (current.position + steps) % state.board.length
    if (current.position + steps >= state.board.length) {
      // 월급 20만원
      current.cash += 200000
      state.log.unshift({ timestamp: Date.now(), message: `${current.name} 월급 20만원 수령` })
    }
    current.position = newPos

    // 칸 처리
    const cell = state.board[newPos]
    this.handleCell(state, current, cell, roomId)

    const isDouble = d1 === d2
    if (isDouble) {
      const count = (room.doubleCount.get(current.id) || 0) + 1
      room.doubleCount.set(current.id, count)
      if (count >= 3) {
        // 3연속 더블 → 무인도
        current.position = 10 // 무인도 칸
        current.inIsland = 3
        room.doubleCount.set(current.id, 0)
        state.log.unshift({ timestamp: Date.now(), message: `${current.name} 3연속 더블! 무인도로 이동` })
        state.currentTurn = this.turn.next(state.turnOrder, state.currentTurn)
      } else {
        state.log.unshift({ timestamp: Date.now(), message: `${current.name} 더블! (${count}회 연속)` })
      }
    } else {
      room.doubleCount.set(current.id, 0)
      // 턴 넘김
      state.currentTurn = this.turn.next(state.turnOrder, state.currentTurn)
    }

    return { ok: true as const, playerId: current.id, dice: [d1, d2] as [number, number], isDouble, state }
  }

  endTurn(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const prev = room.state.currentTurn
    room.state.currentTurn = this.turn.next(room.state.turnOrder, prev)
    return { ok: true as const, prevPlayerId: prev, nextPlayerId: room.state.currentTurn, state: room.state }
  }

  buyProperty(roomId: string, propertyId: number) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const state = room.state
    const player = state.players.find(p => p.id === state.currentTurn)!
    const cell = state.board.find(c => c.id === propertyId)!
    if (cell.type !== 'property' || !cell.property) return { ok: false as const, message: '구매 불가' }
    if (cell.property.owner) return { ok: false as const, message: '이미 소유됨' }
    const price = cell.property.price || 0
    if (player.cash < price) return { ok: false as const, message: '자금 부족' }
    player.cash -= price
    cell.property.owner = player.id
    state.log.unshift({ timestamp: Date.now(), message: `${player.name}이(가) ${cell.property.name}를 구매(-${price})` })
    return { ok: true as const, playerId: player.id, property: cell.property, state }
  }

  buildBuilding(roomId: string, propertyId: number, type: 'villa'|'building'|'hotel') {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const state = room.state
    const player = state.players.find(p => p.id === state.currentTurn)!
    const cell = state.board.find(c => c.id === propertyId)!
    if (cell.type !== 'property' || !cell.property) return { ok: false as const, message: '건설 불가' }
    if (cell.property.owner !== player.id) return { ok: false as const, message: '내 땅이 아님' }
    
    // 색 그룹 완성 확인
    if (!room.propertyMgr.canBuildBuilding(state, player.id, propertyId)) {
      return { ok: false as const, message: '같은 색 그룹을 모두 소유해야 건설 가능' }
    }
    
    const cost = room.propertyMgr.getBuildingCost(cell.property)
    if (player.cash < cost) return { ok: false as const, message: '자금 부족' }
    
    player.cash -= cost
    cell.property.building = type
    state.log.unshift({ timestamp: Date.now(), message: `${player.name}이(가) ${cell.property.name}에 ${type} 건설(-${cost / 10000}만원)` })
    return { ok: true as const, playerId: player.id, property: cell.property, state }
  }

  proposeTrade(roomId: string, fromPlayerId: string, toPlayerId: string, fromCash: number, toCash: number, fromProperties: number[], toProperties: number[]) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const tradeId = `${roomId}-${Date.now()}`
    return room.tradeMgr.proposeTrade(tradeId, fromPlayerId, toPlayerId, fromCash, toCash, fromProperties, toProperties)
  }

  acceptTrade(roomId: string, tradeId: string) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    return room.tradeMgr.acceptTrade(room.state, tradeId)
  }

  rejectTrade(roomId: string, tradeId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return { ok: false as const, message: '방이 없습니다' }
    return room.tradeMgr.rejectTrade(tradeId)
  }

  getPendingTrades(roomId: string, playerId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return []
    return room.tradeMgr.getPendingTrades(playerId)
  }

  sellBuilding(roomId: string, playerId: string, propertyId: number) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const success = room.bankruptcyMgr.sellBuilding(room.state, playerId, propertyId)
    if (success) {
      return { ok: true as const, state: room.state }
    }
    return { ok: false as const, message: '매각 실패' }
  }

  sellProperty(roomId: string, playerId: string, propertyId: number) {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false as const, message: '방이 없습니다' }
    const success = room.bankruptcyMgr.sellProperty(room.state, playerId, propertyId)
    if (success) {
      return { ok: true as const, state: room.state }
    }
    return { ok: false as const, message: '매각 실패' }
  }

  checkVictory(roomId: string): { gameOver: boolean; winner?: Player } {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { gameOver: false }
    
    const alivePlayers = room.state.players.filter(p => !p.bankrupt)
    if (alivePlayers.length === 1) {
      return { gameOver: true, winner: alivePlayers[0] }
    }
    
    return { gameOver: false }
  }

  addAIPlayer(roomId: string, difficulty: AIDifficulty): { ok: true; player: Player } | { ok: false; message: string } {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false, message: '방이 없습니다' }
    if (room.players.length >= 5) return { ok: false, message: '정원 초과' }

    const aiColors: ('red' | 'blue' | 'yellow' | 'green' | 'purple')[] = ['red', 'blue', 'yellow', 'green', 'purple']
    const usedColors = room.players.map(p => p.color)
    const availableColor = aiColors.find(c => !usedColors.includes(c)) || 'red'

    const aiPlayer: Player = {
      id: randomUUID(),
      name: `AI ${difficulty.toUpperCase()}`,
      color: availableColor,
      cash: 1500000,
      position: 0,
      isAI: true,
      aiDifficulty: difficulty
    }

    room.players.push(aiPlayer)
    room.state.players.push(aiPlayer)
    room.state.turnOrder.push(aiPlayer.id)
    room.aiPlayers.set(aiPlayer.id, new AIPlayer(difficulty))

    return { ok: true, player: aiPlayer }
  }

  executeAITurn(roomId: string, aiPlayerId: string): {
    ok: boolean
    actions?: Array<{ type: string; data: any }>
    state?: GameState
  } {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false }

    const aiPlayer = room.state.players.find(p => p.id === aiPlayerId)
    if (!aiPlayer || !aiPlayer.isAI) return { ok: false }

    const ai = room.aiPlayers.get(aiPlayerId)
    if (!ai) return { ok: false }

    const decision = ai.makeDecision(room.state, aiPlayer)
    const actions: Array<{ type: string; data: any }> = []

    switch (decision.action) {
      case 'buyProperty':
        if (decision.propertyId !== undefined) {
          const result = this.buyProperty(roomId, decision.propertyId)
          if (result.ok) {
            actions.push({ type: 'buyProperty', data: { propertyId: decision.propertyId } })
          }
        }
        break

      case 'buildBuilding':
        if (decision.propertyId !== undefined && decision.buildingType) {
          const result = this.buildBuilding(roomId, decision.propertyId, decision.buildingType)
          if (result.ok) {
            actions.push({
              type: 'buildBuilding',
              data: { propertyId: decision.propertyId, buildingType: decision.buildingType }
            })
          }
        }
        break

      case 'sellAsset':
        if (decision.propertyId !== undefined) {
          // 건물 매각 시도
          const sellBuildingResult = this.sellBuilding(roomId, aiPlayerId, decision.propertyId)
          if (sellBuildingResult.ok) {
            actions.push({ type: 'sellBuilding', data: { propertyId: decision.propertyId } })
          } else {
            // 부동산 매각
            const sellPropertyResult = this.sellProperty(roomId, aiPlayerId, decision.propertyId)
            if (sellPropertyResult.ok) {
              actions.push({ type: 'sellProperty', data: { propertyId: decision.propertyId } })
            }
          }
        }
        break

      case 'trade':
        if (decision.targetPlayerId && decision.propertiesOffer && decision.cashOffer !== undefined) {
          const result = this.proposeTrade(
            roomId,
            aiPlayerId,
            decision.targetPlayerId,
            decision.cashOffer,
            0,
            decision.propertiesOffer,
            []
          )
          if (result.ok) {
            actions.push({
              type: 'proposeTrade',
              data: {
                targetPlayerId: decision.targetPlayerId,
                cashOffer: decision.cashOffer,
                propertiesOffer: decision.propertiesOffer
              }
            })
          }
        }
        break

      case 'pass':
      default:
        actions.push({ type: 'pass', data: {} })
        break
    }

    return { ok: true, actions, state: room.state }
  }

  async saveGameState(roomId: string): Promise<{ ok: boolean; message?: string }> {
    const room = this.rooms.get(roomId)
    if (!room?.state) return { ok: false, message: '방이 없습니다' }

    try {
      await GameSave.findOneAndUpdate(
        { roomId },
        {
          roomId,
          gameState: room.state,
          lastUpdated: new Date(),
          isActive: true
        },
        { upsert: true, new: true }
      )
      return { ok: true }
    } catch (error) {
      console.error('게임 저장 실패:', error)
      return { ok: false, message: '저장 실패' }
    }
  }

  async loadGameState(roomId: string): Promise<{ ok: boolean; state?: GameState; message?: string }> {
    try {
      const savedGame = await GameSave.findOne({ roomId, isActive: true })
      if (!savedGame) {
        return { ok: false, message: '저장된 게임이 없습니다' }
      }

      // 방이 이미 있으면 상태 복원
      const room = this.rooms.get(roomId)
      if (room) {
        room.state = savedGame.gameState
        return { ok: true, state: savedGame.gameState }
      }

      return { ok: false, message: '방이 없습니다' }
    } catch (error) {
      console.error('게임 로드 실패:', error)
      return { ok: false, message: '로드 실패' }
    }
  }

  async endGame(roomId: string): Promise<{ ok: boolean }> {
    try {
      // 자동 저장 중지
      this.stopAutoSave(roomId)
      
      await GameSave.findOneAndUpdate(
        { roomId },
        { isActive: false }
      )
      this.rooms.delete(roomId)
      return { ok: true }
    } catch (error) {
      console.error('게임 종료 실패:', error)
      return { ok: false }
    }
  }

  private startAutoSave(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    // 3분마다 자동 저장
    room.autoSaveInterval = setInterval(() => {
      this.saveGameState(roomId).then(result => {
        if (!result.ok) {
          console.error(`자동 저장 실패: ${roomId}`)
        }
      })
    }, 3 * 60 * 1000)
  }

  private stopAutoSave(roomId: string) {
    const room = this.rooms.get(roomId)
    if (room?.autoSaveInterval) {
      clearInterval(room.autoSaveInterval)
      room.autoSaveInterval = undefined
    }
  }

  async handleReconnect(roomId: string, playerId: string): Promise<{ ok: boolean; state?: GameState; message?: string }> {
    // 먼저 메모리에 방이 있는지 확인
    let room = this.rooms.get(roomId)
    
    if (!room) {
      // 메모리에 없으면 DB에서 복원 시도
      const loadResult = await this.loadGameState(roomId)
      if (!loadResult.ok || !loadResult.state) {
        return { ok: false, message: '게임을 찾을 수 없습니다' }
      }
      
      // 방 재생성
      this.rooms.set(roomId, {
        id: roomId,
        name: 'Restored Game',
        players: loadResult.state.players,
        state: loadResult.state,
        doubleCount: new Map(),
        deckPointer: 0,
        eventHandler: new EventHandler(),
        propertyMgr: new PropertyManager(),
        tradeMgr: new TradeManager(),
        bankruptcyMgr: new BankruptcyManager(),
        aiPlayers: new Map()
      })
      this.startAutoSave(roomId)
      room = this.rooms.get(roomId)!
    }

    // 플레이어가 게임에 있는지 확인
    if (!room.state) {
      return { ok: false, message: '게임 상태가 없습니다' }
    }
    
    const playerExists = room.state.players.some(p => p.id === playerId)
    if (!playerExists) {
      return { ok: false, message: '플레이어를 찾을 수 없습니다' }
    }

    return { ok: true, state: room.state }
  }

  private handleCell(state: GameState, player: Player, cell: Cell, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return
    
    switch (cell.type) {
      case 'property': {
        const prop = cell.property!
        if (!prop.owner) {
          state.log.unshift({ timestamp: Date.now(), message: `${player.name} 빈 땅 도착: ${prop.name}` })
        } else if (prop.owner !== player.id) {
          // 통행료: PropertyManager로 계산
          const toll = room.propertyMgr.calculateToll(prop, prop.building || 'none')
          player.cash -= toll
          const owner = state.players.find(p => p.id === prop.owner)!
          owner.cash += toll
          state.log.unshift({ timestamp: Date.now(), message: `${player.name} → ${owner.name} 통행료 ${toll / 10000}만원 지급` })
          
          // 파산 체크
          const bankruptResult = room.bankruptcyMgr.checkBankruptcy(state, player.id, owner.id)
          if (bankruptResult.bankrupted) {
            if (bankruptResult.winner) {
              state.log.unshift({
                timestamp: Date.now(),
                message: `🎉 ${bankruptResult.winner.name} 승리! 모든 상대가 파산했습니다!`
              })
              // 승리 처리는 socket 이벤트로 전달
            }
          }
        }
        break
      }
      case 'tax': {
        const amount = Math.max(50000, Math.floor(player.cash * 0.1))
        player.cash -= amount
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 소득세 ${amount} 납부` })
        break
      }
      case 'start':
        break
      case 'island': {
        player.inIsland = 3
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 무인도 3턴` })
        break
      }
      case 'world-tour': {
        // 월급 2배 지급(간이)
        player.cash += 400000
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 세계여행 보너스 +40만원` })
        break
      }
      case 'space-travel': {
        // 원하는 칸 이동은 클라 UI 선택 필요 → 간이로 START로 이동
        player.position = 0
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 우주여행으로 출발점 이동` })
        break
      }
      case 'golden-key': {
        // 덱 포인터로 순환 추출
        const cardId = (room.deckPointer % 20) + 1
        room.deckPointer += 1
        room.eventHandler.handleGoldenKey(state, player, cardId)
        break
      }
      case 'welfare':
        player.cash += room.eventHandler.getWelfareFund()
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 복지기금 ${room.eventHandler.getWelfareFund() / 10000}만원 획득` })
        room.eventHandler.addToWelfareFund(-room.eventHandler.getWelfareFund())
        break
      case 'maintenance': {
        // 건물당 1만원 유지비
        const buildingCount = state.board.filter(c => 
          c.type === 'property' && c.property?.owner === player.id && c.property?.building !== 'none'
        ).length
        const fee = buildingCount * 10000
        player.cash -= fee
        room.eventHandler.addToWelfareFund(fee)
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 유지비 ${fee / 10000}만원 납부` })
        break
      }
      default:
        break
    }
  }
}
