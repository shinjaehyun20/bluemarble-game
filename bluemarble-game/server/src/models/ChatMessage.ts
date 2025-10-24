import { Schema, model } from 'mongoose'

interface IChatMessage {
  roomId: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
}

const ChatMessageSchema = new Schema<IChatMessage>({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  playerId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

// TTL 인덱스: 메시지는 7일 후 자동 삭제
ChatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema)
