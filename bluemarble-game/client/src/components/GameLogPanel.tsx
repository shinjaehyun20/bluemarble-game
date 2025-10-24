import type { GameLog } from '../types/game.types'

interface Props { log: GameLog[] }

export default function GameLogPanel({ log }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-400">게임 로그</div>
      <div className="bg-slate-800 rounded-md p-3 h-64 overflow-y-auto space-y-1">
        {log.length === 0 && <div className="text-slate-500 text-sm">게임 시작 전입니다</div>}
        {log.map((entry, i) => (
          <div key={i} className="text-xs text-slate-300">
            • {entry.message}
          </div>
        ))}
      </div>
    </div>
  )
}
