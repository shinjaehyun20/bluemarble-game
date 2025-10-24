import { useState } from 'react'
import type { Cell, Property, Player } from '../types/game.types'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TradeModal = ({ isOpen, onClose }: TradeModalProps) => {
  const socket = useSocket()
  const { state, me, roomId } = useGameStore()
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null)
  const [myCash, setMyCash] = useState(0)
  const [theirCash, setTheirCash] = useState(0)
  const [myProperties, setMyProperties] = useState<number[]>([])
  const [theirProperties, setTheirProperties] = useState<number[]>([])

  if (!isOpen || !state || !me) return null

  const otherPlayers = state.players.filter(p => p.id !== me.id && !p.bankrupt)
  const selectedPlayer = otherPlayers.find(p => p.id === targetPlayer)

  const myOwnedProperties = state.board.filter(
    (cell): cell is Cell & { property: Property } =>
      cell.type === 'property' &&
      !!cell.property &&
      cell.property.owner === me.id
  )

  const theirOwnedProperties = targetPlayer
    ? state.board.filter(
        (cell): cell is Cell & { property: Property } =>
          cell.type === 'property' &&
          !!cell.property &&
          cell.property.owner === targetPlayer
      )
    : []

  const handlePropose = () => {
    if (!socket || !roomId || !targetPlayer) return
    socket.emit('proposeTrade', {
      roomId,
      toPlayerId: targetPlayer,
      fromCash: myCash,
      toCash: theirCash,
      fromProperties: myProperties,
      toProperties: theirProperties
    })
    onClose()
    // 초기화
    setMyCash(0)
    setTheirCash(0)
    setMyProperties([])
    setTheirProperties([])
    setTargetPlayer(null)
  }

  const toggleMyProperty = (id: number) => {
    setMyProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleTheirProperty = (id: number) => {
    setTheirProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">거래 제안</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* 플레이어 선택 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">거래 상대 선택</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {otherPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setTargetPlayer(player.id)}
                className={`p-3 border rounded transition ${
                  targetPlayer === player.id
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {(player.cash / 10000).toFixed(0)}만원
                </div>
              </button>
            ))}
          </div>
        </div>

        {targetPlayer && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 내 제안 */}
            <div className="border rounded p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">
                내가 주는 것 ({me.name})
              </h3>

              {/* 현금 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">현금</label>
                <input
                  type="number"
                  value={myCash}
                  onChange={(e) => setMyCash(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                  max={me.cash}
                />
                <div className="text-xs text-gray-500 mt-1">
                  보유: {(me.cash / 10000).toFixed(0)}만원
                </div>
              </div>

              {/* 부동산 */}
              <div>
                <label className="block text-sm font-medium mb-2">부동산</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {myOwnedProperties.map((cell) => (
                    <div
                      key={cell.id}
                      onClick={() => toggleMyProperty(cell.id)}
                      className={`p-2 border rounded cursor-pointer transition ${
                        myProperties.includes(cell.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{cell.property.name}</div>
                      <div className="text-xs text-gray-600">
                        {((cell.property.price || 0) / 10000).toFixed(0)}만원
                        {cell.property.building !== 'none' && ` · ${cell.property.building}`}
                      </div>
                    </div>
                  ))}
                  {myOwnedProperties.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      소유한 부동산이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상대방 요구 */}
            <div className="border rounded p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-600">
                내가 받는 것 ({selectedPlayer?.name})
              </h3>

              {/* 현금 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">현금</label>
                <input
                  type="number"
                  value={theirCash}
                  onChange={(e) => setTheirCash(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                  max={selectedPlayer?.cash || 0}
                />
                <div className="text-xs text-gray-500 mt-1">
                  보유: {((selectedPlayer?.cash || 0) / 10000).toFixed(0)}만원
                </div>
              </div>

              {/* 부동산 */}
              <div>
                <label className="block text-sm font-medium mb-2">부동산</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {theirOwnedProperties.map((cell) => (
                    <div
                      key={cell.id}
                      onClick={() => toggleTheirProperty(cell.id)}
                      className={`p-2 border rounded cursor-pointer transition ${
                        theirProperties.includes(cell.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{cell.property.name}</div>
                      <div className="text-xs text-gray-600">
                        {((cell.property.price || 0) / 10000).toFixed(0)}만원
                        {cell.property.building !== 'none' && ` · ${cell.property.building}`}
                      </div>
                    </div>
                  ))}
                  {theirOwnedProperties.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      소유한 부동산이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button
            onClick={handlePropose}
            disabled={!targetPlayer || (myCash === 0 && theirCash === 0 && myProperties.length === 0 && theirProperties.length === 0)}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            거래 제안하기
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
