import useSocket from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'
import { AIPlayerPanel } from './AIPlayerPanel'

export default function WaitingRoom({ onStart, onBack }: { onStart: () => void, onBack: () => void }) {
  const socket = useSocket()
  const { roomId } = useGameStore()

  const startGame = () => {
    if (!roomId) return
    socket?.emit('startGame', { roomId })
    onStart()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button className="bg-slate-600 hover:bg-slate-500" onClick={onBack}>← 나가기</button>
        <div>방: {roomId}</div>
      </div>
      
      {/* AI 플레이어 추가 패널 */}
      {roomId && <AIPlayerPanel roomId={roomId} />}
      
      <div className="bg-slate-800 p-4 rounded-md">
        <div className="flex gap-3">
          <button onClick={startGame}>게임 시작</button>
        </div>
      </div>
    </div>
  )
}
