import { useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

interface TradeOffer {
  id: string
  fromPlayerId: string
  toPlayerId: string
  fromCash: number
  toCash: number
  fromProperties: number[]
  toProperties: number[]
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: number
}

export const TradeNotification = () => {
  const socket = useSocket()
  const { state, me, roomId } = useGameStore()
  const [offer, setOffer] = useState<TradeOffer | null>(null)

  useEffect(() => {
    if (!socket) return

    socket.on('tradeProposed', ({ offer: newOffer }: { offer: TradeOffer }) => {
      // 내가 받는 제안인 경우에만 표시
      if (newOffer.toPlayerId === me?.id) {
        setOffer(newOffer)
      }
    })

    socket.on('tradeRejected', ({ tradeId }: { tradeId: string }) => {
      if (offer?.id === tradeId) {
        setOffer(null)
      }
    })

    return () => {
      socket.off('tradeProposed')
      socket.off('tradeRejected')
    }
  }, [socket, me?.id, offer?.id])

  if (!offer || !state || !me || !socket || !roomId) return null

  const fromPlayer = state.players.find(p => p.id === offer.fromPlayerId)
  if (!fromPlayer) return null

  const handleAccept = () => {
    socket.emit('acceptTrade', { roomId, tradeId: offer.id })
    setOffer(null)
  }

  const handleReject = () => {
    socket.emit('rejectTrade', { roomId, tradeId: offer.id })
    setOffer(null)
  }

  const getPropertyName = (id: number) => {
    const cell = state.board.find(c => c.id === id)
    return cell?.type === 'property' ? cell.property?.name || '알 수 없음' : '알 수 없음'
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-md animate-bounce z-50">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">💼 거래 제안</h3>
        <button onClick={handleReject} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold text-blue-600">{fromPlayer.name}</span>님이 거래를 제안했습니다
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* 상대가 주는 것 */}
          <div className="border rounded p-2 bg-green-50">
            <div className="text-xs font-semibold text-green-700 mb-1">내가 받을 것</div>
            {offer.fromCash > 0 && (
              <div className="text-sm">💰 {(offer.fromCash / 10000).toFixed(0)}만원</div>
            )}
            {offer.fromProperties.map(propId => (
              <div key={propId} className="text-xs">🏠 {getPropertyName(propId)}</div>
            ))}
            {offer.fromCash === 0 && offer.fromProperties.length === 0 && (
              <div className="text-xs text-gray-500">없음</div>
            )}
          </div>

          {/* 내가 주는 것 */}
          <div className="border rounded p-2 bg-blue-50">
            <div className="text-xs font-semibold text-blue-700 mb-1">내가 줄 것</div>
            {offer.toCash > 0 && (
              <div className="text-sm">💰 {(offer.toCash / 10000).toFixed(0)}만원</div>
            )}
            {offer.toProperties.map(propId => (
              <div key={propId} className="text-xs">🏠 {getPropertyName(propId)}</div>
            ))}
            {offer.toCash === 0 && offer.toProperties.length === 0 && (
              <div className="text-xs text-gray-500">없음</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-semibold"
        >
          수락
        </button>
        <button
          onClick={handleReject}
          className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-semibold"
        >
          거절
        </button>
      </div>
    </div>
  )
}
