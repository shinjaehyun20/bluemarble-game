import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onRoll: () => void
  dice: [number, number] | null
  disabled?: boolean
}

export default function Dice({ onRoll, dice, disabled }: Props) {
  const [rolling, setRolling] = useState(false)

  const handleRoll = () => {
    if (disabled || rolling) return
    setRolling(true)
    onRoll()
    setTimeout(() => setRolling(false), 1000)
  }

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleRoll} 
        disabled={disabled || rolling}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🎲 주사위 굴리기
      </button>
      {dice && (
        <div className="flex gap-2">
          <motion.div 
            key={`d1-${dice[0]}`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: rolling ? 720 : 0 }}
            transition={{ duration: 0.8 }}
            className="w-12 h-12 bg-white text-black rounded-md flex items-center justify-center text-2xl font-bold shadow-lg"
          >
            {dice[0]}
          </motion.div>
          <motion.div 
            key={`d2-${dice[1]}`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: rolling ? 720 : 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-12 h-12 bg-white text-black rounded-md flex items-center justify-center text-2xl font-bold shadow-lg"
          >
            {dice[1]}
          </motion.div>
          <div className="flex items-center text-sm text-slate-300">
            = {dice[0] + dice[1]}
            {dice[0] === dice[1] && <span className="ml-2 text-yellow-400">더블!</span>}
          </div>
        </div>
      )}
    </div>
  )
}
