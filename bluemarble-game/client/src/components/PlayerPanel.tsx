import type { Player } from '../types/game.types'

interface Props { players: Player[], currentTurnId: string }

const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500'
}

export default function PlayerPanel({ players, currentTurnId }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-400">플레이어</div>
      {players.map(p => (
        <div 
          key={p.id} 
          className={`p-3 rounded-md ${p.id === currentTurnId ? 'bg-slate-700 ring-2 ring-indigo-400' : 'bg-slate-800'}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${colorMap[p.color] || 'bg-gray-500'}`} />
            <div className="flex-1 font-semibold">{p.name}</div>
            {p.id === currentTurnId && <span className="text-xs text-indigo-300">턴</span>}
          </div>
          <div className="mt-1 text-sm text-slate-300">
            💰 {(p.cash / 10000).toFixed(0)}만원
            {p.inIsland ? ` | 🏝️ ${p.inIsland}턴` : ''}
            {p.bankrupt && <span className="ml-2 text-red-400">파산</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
