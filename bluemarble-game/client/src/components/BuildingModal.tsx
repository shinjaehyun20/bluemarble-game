import { useState } from 'react'
import type { Cell, Property } from '../types/game.types'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

interface BuildingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BuildingModal = ({ isOpen, onClose }: BuildingModalProps) => {
  const socket = useSocket()
  const { state, me, roomId } = useGameStore()
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null)
  const [buildingType, setBuildingType] = useState<'villa' | 'building' | 'hotel'>('villa')

  if (!isOpen || !state || !me) return null

  // 내가 소유한 부동산만 필터링
  const myProperties = state.board.filter(
    (cell): cell is Cell & { property: Property } =>
      cell.type === 'property' &&
      !!cell.property &&
      cell.property.owner === me.id
  )

  // 색 그룹별로 분류
  const groupedProperties = myProperties.reduce((acc, cell) => {
    const group = cell.property.colorGroup || 'none'
    if (!acc[group]) acc[group] = []
    acc[group].push(cell)
    return acc
  }, {} as Record<string, typeof myProperties>)

  // 그룹 완성 확인 (간단 버전 - 서버에서 최종 검증)
  const colorGroups: Record<string, number> = {
    brown: 2,
    blue: 3,
    purple: 3,
    orange: 3,
    red: 3,
    yellow: 3,
    green: 3,
    black: 2
  }

  const handleBuild = () => {
    if (!selectedProperty || !socket || !roomId) return
    socket.emit('buildBuilding', { roomId, propertyId: selectedProperty, type: buildingType })
    onClose()
  }

  const getBuildingCost = (prop: Property) => {
    return Math.floor((prop.price || 0) * 0.5)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">건물 건설</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            💡 같은 색 그룹을 모두 소유해야 건설할 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedProperties).map(([group, properties]) => {
            const totalInGroup = colorGroups[group] || 0
            const isComplete = properties.length === totalInGroup
            
            return (
              <div
                key={group}
                className={`border rounded p-4 ${
                  isComplete ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg capitalize">{group} 그룹</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    isComplete ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {properties.length}/{totalInGroup} {isComplete && '✓ 완성'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {properties.map((cell) => (
                    <div
                      key={cell.id}
                      onClick={() => isComplete && setSelectedProperty(cell.id)}
                      className={`p-3 border rounded cursor-pointer transition ${
                        selectedProperty === cell.id
                          ? 'border-blue-500 bg-blue-100'
                          : isComplete
                          ? 'border-gray-300 hover:border-blue-300'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{cell.property.name}</div>
                      <div className="text-sm text-gray-600">
                        가격: {((cell.property.price || 0) / 10000).toFixed(0)}만원
                      </div>
                      <div className="text-sm text-gray-600">
                        현재: {cell.property.building === 'none' ? '빈땅' : cell.property.building}
                      </div>
                      {isComplete && (
                        <div className="text-sm text-blue-600 mt-1">
                          건설비용: {(getBuildingCost(cell.property) / 10000).toFixed(0)}만원
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selectedProperty && (
          <div className="mt-6 p-4 border-t">
            <h3 className="font-semibold mb-3">건물 종류 선택</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(['villa', 'building', 'hotel'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setBuildingType(type)}
                  className={`p-3 border rounded transition ${
                    buildingType === type
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-xs text-gray-600">
                    {type === 'villa' && '통행료 0.5배'}
                    {type === 'building' && '통행료 2배'}
                    {type === 'hotel' && '통행료 5배'}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBuild}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                건설하기
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {myProperties.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            소유한 부동산이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
