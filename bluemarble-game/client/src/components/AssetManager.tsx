import { useState } from 'react'
import type { Cell, Property } from '../types/game.types'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

interface AssetManagerProps {
  isOpen: boolean
  onClose: () => void
}

export const AssetManager = ({ isOpen, onClose }: AssetManagerProps) => {
  const socket = useSocket()
  const { state, me, roomId } = useGameStore()
  const [selectedAction, setSelectedAction] = useState<'sellBuilding' | 'sellProperty'>('sellBuilding')

  if (!isOpen || !state || !me) return null

  const myProperties = state.board.filter(
    (cell): cell is Cell & { property: Property } =>
      cell.type === 'property' &&
      !!cell.property &&
      cell.property.owner === me.id
  )

  const propertiesWithBuildings = myProperties.filter(
    cell => cell.property.building !== 'none'
  )

  const handleSellBuilding = (propertyId: number) => {
    if (!socket || !roomId) return
    if (window.confirm('건물을 매각하시겠습니까? (건설 비용의 50% 회수)')) {
      socket.emit('sellBuilding', { roomId, playerId: me.id, propertyId })
    }
  }

  const handleSellProperty = (propertyId: number) => {
    if (!socket || !roomId) return
    if (window.confirm('부동산을 매각하시겠습니까? (부동산 가격의 50% 회수)')) {
      socket.emit('sellProperty', { roomId, playerId: me.id, propertyId })
    }
  }

  const getBuildingRefund = (prop: Property) => {
    return Math.floor((prop.price || 0) * 0.5 * 0.5)
  }

  const getPropertyRefund = (prop: Property) => {
    return Math.floor((prop.price || 0) * 0.5)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">자산 관리</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ 매각 시 원가의 50%만 회수됩니다. 신중하게 선택하세요.
          </p>
        </div>

        {/* 현재 자산 현황 */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">현재 보유 현황</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">현금</div>
              <div className="text-xl font-bold">{(me.cash / 10000).toFixed(0)}만원</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">부동산</div>
              <div className="text-xl font-bold">{myProperties.length}건</div>
            </div>
          </div>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedAction('sellBuilding')}
            className={`flex-1 py-2 px-4 rounded transition ${
              selectedAction === 'sellBuilding'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            건물 매각 ({propertiesWithBuildings.length})
          </button>
          <button
            onClick={() => setSelectedAction('sellProperty')}
            className={`flex-1 py-2 px-4 rounded transition ${
              selectedAction === 'sellProperty'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            부동산 매각 ({myProperties.length})
          </button>
        </div>

        {/* 건물 매각 */}
        {selectedAction === 'sellBuilding' && (
          <div className="space-y-2">
            {propertiesWithBuildings.map((cell) => (
              <div
                key={cell.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">{cell.property.name}</div>
                  <div className="text-sm text-gray-600">
                    건물: {cell.property.building} · 
                    회수금액: {(getBuildingRefund(cell.property) / 10000).toFixed(0)}만원
                  </div>
                </div>
                <button
                  onClick={() => handleSellBuilding(cell.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  매각
                </button>
              </div>
            ))}
            {propertiesWithBuildings.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                매각할 건물이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 부동산 매각 */}
        {selectedAction === 'sellProperty' && (
          <div className="space-y-2">
            {myProperties.map((cell) => (
              <div
                key={cell.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">{cell.property.name}</div>
                  <div className="text-sm text-gray-600">
                    원가: {((cell.property.price || 0) / 10000).toFixed(0)}만원 · 
                    회수금액: {(getPropertyRefund(cell.property) / 10000).toFixed(0)}만원
                    {cell.property.building !== 'none' && ` · ${cell.property.building}`}
                  </div>
                </div>
                <button
                  onClick={() => handleSellProperty(cell.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  매각
                </button>
              </div>
            ))}
            {myProperties.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                소유한 부동산이 없습니다.
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
