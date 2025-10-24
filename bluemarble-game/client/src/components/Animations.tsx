import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TokenAnimationProps {
  position: number
  color: string
  playerName: string
  isMoving: boolean
  fromPosition?: number
}

export const TokenAnimation: React.FC<TokenAnimationProps> = ({
  position,
  color,
  playerName,
  isMoving,
  fromPosition
}) => {
  const getTokenPosition = (pos: number) => {
    // 보드판 위치를 픽셀 좌표로 변환
    // 부루마블은 40칸 (0-39)
    const cellSize = 80
    const boardSize = 10 // 10x10 그리드
    
    let x = 0, y = 0
    
    if (pos <= 10) {
      // 하단 (좌→우)
      x = pos * cellSize
      y = boardSize * cellSize
    } else if (pos <= 20) {
      // 우측 (하→상)
      x = boardSize * cellSize
      y = (boardSize - (pos - 10)) * cellSize
    } else if (pos <= 30) {
      // 상단 (우→좌)
      x = (boardSize - (pos - 20)) * cellSize
      y = 0
    } else {
      // 좌측 (상→하)
      x = 0
      y = (pos - 30) * cellSize
    }
    
    return { x, y }
  }

  const currentPos = getTokenPosition(position)
  const startPos = fromPosition !== undefined ? getTokenPosition(fromPosition) : currentPos

  const colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    green: '#22c55e',
    purple: '#a855f7'
  }

  return (
    <motion.div
      initial={ isMoving ? startPos : currentPos }
      animate={currentPos}
      transition={{
        duration: isMoving ? 0.8 : 0,
        ease: 'easeInOut'
      }}
      style={{
        position: 'absolute',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: colorMap[color] || color,
        border: '3px solid white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
        zIndex: 100
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {playerName[0].toUpperCase()}
    </motion.div>
  )
}

interface GoldenKeyCardProps {
  cardText: string
  onClose: () => void
}

export const GoldenKeyCard: React.FC<GoldenKeyCardProps> = ({ cardText, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ rotateY: 90, scale: 0.5 }}
          animate={{ rotateY: 0, scale: 1 }}
          exit={{ rotateY: -90, scale: 0.5 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
          style={{
            width: '400px',
            height: '280px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(251, 191, 36, 0.5)',
            border: '4px solid #fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transformStyle: 'preserve-3d'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🔑
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            황금열쇠
          </div>
          <div style={{
            fontSize: '18px',
            color: 'white',
            lineHeight: 1.6,
            maxWidth: '300px'
          }}>
            {cardText}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              marginTop: '24px',
              padding: '12px 32px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#f59e0b',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            확인
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface CashParticleProps {
  amount: number
  isPositive: boolean
  onComplete: () => void
}

export const CashParticle: React.FC<CashParticleProps> = ({ amount, isPositive, onComplete }) => {
  const particles = Array.from({ length: 8 })

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1
          }}
          animate={{
            x: Math.cos((i / particles.length) * Math.PI * 2) * 60,
            y: Math.sin((i / particles.length) * Math.PI * 2) * 60,
            opacity: 0,
            scale: 0.5
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
          onAnimationComplete={() => {
            if (i === 0) onComplete()
          }}
          style={{
            position: 'absolute',
            fontSize: '24px',
            fontWeight: 'bold',
            color: isPositive ? '#22c55e' : '#ef4444',
            pointerEvents: 'none'
          }}
        >
          {isPositive ? '+' : '-'}₩{Math.abs(amount).toLocaleString()}
        </motion.div>
      ))}
    </div>
  )
}

interface BuildingConstructionProps {
  buildingLevel: 'villa' | 'building' | 'hotel'
  onComplete: () => void
}

export const BuildingConstruction: React.FC<BuildingConstructionProps> = ({ buildingLevel, onComplete }) => {
  const getEmoji = () => {
    switch (buildingLevel) {
      case 'villa': return '🏘️'
      case 'building': return '🏢'
      case 'hotel': return '🏨'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: 0.6
      }}
      onAnimationComplete={onComplete}
      style={{
        fontSize: '48px',
        display: 'inline-block'
      }}
    >
      {getEmoji()}
    </motion.div>
  )
}
