import { Schema, model } from 'mongoose'
import type { GameState } from '../services/types'

interface IGameSave {
  roomId: string
  gameState: GameState
  lastUpdated: Date
  isActive: boolean
}

const GameSaveSchema = new Schema<IGameSave>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  gameState: {
    type: Schema.Types.Mixed,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

// TTL 인덱스: 비활성 게임은 7일 후 자동 삭제
GameSaveSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { isActive: false } })

export const GameSave = model<IGameSave>('GameSave', GameSaveSchema)
