import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Player } from '../types/game.types'

interface VictoryScreenProps {
  winner: Player
  players: Player[]
  onClose: () => void
}

export const VictoryScreen = ({ winner, players, onClose }: VictoryScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // 플레이어 순위 계산 (자산 기준)
  const rankings = players
    .map((player) => {
      // 간단한 자산 계산 (현금만)
      const totalAssets = player.cash
      return { ...player, totalAssets }
    })
    .sort((a, b) => b.totalAssets - a.totalAssets)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">게임 종료!</h1>
          <div className="text-2xl font-semibold" style={{ color: winner.color }}>
            {winner.name}님 승리!
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">최종 순위</h2>
          <div className="space-y-2">
            {rankings.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gray-100 border-2 border-gray-400'
                    : index === 2
                    ? 'bg-orange-100 border-2 border-orange-400'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold w-8">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: player.color }}>
                      {player.name}
                      {player.bankrupt && ' (파산)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      총 자산: {(player.totalAssets / 10000).toFixed(0)}만원
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className="text-yellow-500 text-2xl">👑</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition text-lg font-semibold"
          >
            로비로 돌아가기
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition"
          >
            새 게임 시작
          </button>
        </div>
      </motion.div>
    </div>
  )
}
