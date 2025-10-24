import mongoose, { Schema } from 'mongoose'

const PlayerSchema = new Schema({
  id: { type: String, required: true },
  name: String,
  color: String,
  cash: Number,
  position: Number,
  inIsland: Number,
  bankrupt: Boolean
}, { _id: false })

const RoomSchema = new Schema({
  id: { type: String, index: true },
  name: String,
  status: { type: String, default: 'waiting' },
  players: [PlayerSchema],
  createdAt: { type: Date, default: Date.now }
})

export const RoomModel = mongoose.model('Room', RoomSchema)
