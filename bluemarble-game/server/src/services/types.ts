export type Color = 'red' | 'blue' | 'yellow' | 'green' | 'purple'

export interface Player {
  id: string
  name: string
  color: Color
  cash: number
  position: number
  inIsland?: number
  bankrupt?: boolean
  isAI?: boolean
  aiDifficulty?: 'easy' | 'normal' | 'hard'
}

export interface Property {
  id: number
  name: string
  colorGroup?: string
  price?: number
  owner?: string
  building?: 'none' | 'villa' | 'building' | 'hotel'
}

export interface Cell {
  id: number
  type: 'start' | 'property' | 'tax' | 'golden-key' | 'world-tour' | 'space-travel' | 'island' | 'welfare' | 'maintenance'
  name?: string
  property?: Property
}

export interface GameLog {
  timestamp: number
  message: string
}

export interface GameState {
  board: Cell[]
  players: Player[]
  currentTurn: string
  turnOrder: string[]
  log: GameLog[]
  deckPointer?: number
}
