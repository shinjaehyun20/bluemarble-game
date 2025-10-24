import { create } from 'zustand'
import type { GameState, Player } from '../types/game.types'

interface GameStore {
  roomId: string | null
  me: Player | null
  state: GameState | null
  log: string[]
  setRoom: (roomId: string) => void
  setMe: (player: Player) => void
  setState: (state: GameState) => void
  pushLog: (msg: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  me: null,
  state: null,
  log: [],
  setRoom: (roomId) => set({ roomId }),
  setMe: (me) => set({ me }),
  setState: (state) => set({ state }),
  pushLog: (msg) => set((s) => ({ log: [msg, ...s.log].slice(0, 200) })),
}))
