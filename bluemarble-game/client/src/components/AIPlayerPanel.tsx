import { useState } from 'react'
import useSocket from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

interface AIPlayerPanelProps {
  roomId: string
}

export const AIPlayerPanel = ({ roomId }: AIPlayerPanelProps) => {
  const socket = useSocket()
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')

  const handleAddAI = () => {
    if (!socket || !roomId) return
    socket.emit('addAIPlayer', { roomId, difficulty: selectedDifficulty })
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-300">
      <h3 className="font-semibold mb-3 text-lg">🤖 AI 플레이어 추가</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">난이도 선택</label>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'normal', 'hard'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`py-2 px-3 rounded border transition ${
                selectedDifficulty === difficulty
                  ? 'border-blue-500 bg-blue-100 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="text-sm font-semibold capitalize">{difficulty}</div>
              <div className="text-xs text-gray-600">
                {difficulty === 'easy' && '쉬움'}
                {difficulty === 'normal' && '보통'}
                {difficulty === 'hard' && '어려움'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAddAI}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded hover:from-purple-600 hover:to-pink-600 transition font-semibold"
      >
        AI 플레이어 추가
      </button>

      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <div className="font-semibold mb-1">AI 특징:</div>
        <ul className="space-y-1">
          <li>• <span className="font-medium">쉬움:</span> 신중한 플레이, 저가 부동산 선호</li>
          <li>• <span className="font-medium">보통:</span> 색 그룹 전략, 균형잡힌 플레이</li>
          <li>• <span className="font-medium">어려움:</span> 공격적 전략, 거래 제안</li>
        </ul>
      </div>
    </div>
  )
}
