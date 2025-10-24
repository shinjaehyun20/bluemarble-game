import type { Cell, Player } from '../types/game.types'

interface Props { 
  board: Cell[]
  players: Player[]
}

const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500'
}

export default function Board({ board, players }: Props) {
  const getPlayersAtCell = (cellId: number) => {
    return players.filter(p => p.position === cellId && !p.bankrupt)
  }

  const getCellBg = (cell: Cell) => {
    if (cell.type === 'start') return 'bg-green-700'
    if (cell.type === 'island') return 'bg-blue-900'
    if (cell.type === 'golden-key') return 'bg-yellow-700'
    if (cell.type === 'world-tour') return 'bg-purple-700'
    if (cell.type === 'space-travel') return 'bg-indigo-700'
    if (cell.type === 'tax') return 'bg-red-800'
    if (cell.type === 'property' && cell.property?.owner) return 'bg-emerald-800'
    return 'bg-slate-800'
  }

  return (
    <div className="grid grid-cols-11 gap-1 p-2 bg-slate-900 rounded-md">
      {board.map(cell => {
        const cellPlayers = getPlayersAtCell(cell.id)
        return (
          <div 
            key={cell.id} 
            className={`relative h-20 ${getCellBg(cell)} rounded p-1 text-xs overflow-hidden`}
          >
            <div className="font-bold truncate">{cell.id}. {cell.name || cell.type}</div>
            {cell.property && (
              <div className="text-[10px] text-slate-300 truncate">
                {(cell.property.price! / 10000).toFixed(0)}만
                {cell.property.owner && <span className="ml-1">👤</span>}
              </div>
            )}
            {/* 플레이어 말 */}
            <div className="absolute bottom-1 left-1 flex gap-0.5">
              {cellPlayers.map(p => (
                <div 
                  key={p.id} 
                  className={`w-3 h-3 rounded-full ${colorMap[p.color] || 'bg-gray-500'} border border-white`}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
