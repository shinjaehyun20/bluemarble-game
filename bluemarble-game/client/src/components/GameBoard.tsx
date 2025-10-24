import { useEffect, useState } from 'react'
import useSocket from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'
import Board from './Board'
import Dice from './Dice'
import PlayerPanel from './PlayerPanel'
import GameLogPanel from './GameLogPanel'
import { BuildingModal } from './BuildingModal'
import { TradeModal } from './TradeModal'
import { TradeNotification } from './TradeNotification'
import { AssetManager } from './AssetManager'
import { VictoryScreen } from './VictoryScreen'
import { SaveLoadPanel } from './SaveLoadPanel'
import type { Player } from '../types/game.types'

export default function GameBoard({ onExit }: { onExit: () => void }) {
  const socket = useSocket()
  const { roomId, state, setState, pushLog, me } = useGameStore()
  const [dice, setDice] = useState<[number, number] | null>(null)
  const [showBuildingModal, setShowBuildingModal] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showAssetManager, setShowAssetManager] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  useEffect(() => {
    if (!socket) return
    const onGameState = (payload: any) => {
      setState(payload.gameState)
    }
    const onDice = (payload: any) => {
      setDice(payload.dice)
      if (payload.isDouble) {
        pushLog('더블 굴림!')
      }
    }
    socket.on('gameStateUpdate', onGameState)
    socket.on('diceRolled', onDice)

    // 승리 조건 체크
    if (state?.log && state.log.length > 0) {
      const latestLog = state.log[0].message
      if (latestLog.includes('승리')) {
        const victoryPlayer = state.players.find(p => !p.bankrupt && state.players.filter(pl => !pl.bankrupt).length === 1)
        if (victoryPlayer) {
          setWinner(victoryPlayer)
        }
      }
    }

    // AI 턴 자동 실행
    if (state && roomId) {
      const currentPlayer = state.players.find(p => p.id === state.currentTurn)
      if (currentPlayer?.isAI && !currentPlayer.bankrupt) {
        const aiDelay = currentPlayer.aiDifficulty === 'easy' ? 2000 : currentPlayer.aiDifficulty === 'hard' ? 1000 : 1500
        
        setTimeout(() => {
          // 주사위 굴리기
          socket.emit('rollDice', { roomId })
          
          // 추가 행동 실행
          setTimeout(() => {
            socket.emit('executeAITurn', { roomId, aiPlayerId: currentPlayer.id })
            
            // 턴 종료
            setTimeout(() => {
              socket.emit('endTurn', { roomId })
            }, 500)
          }, 1000)
        }, aiDelay)
      }
    }

    return () => {
      socket.off('gameStateUpdate', onGameState)
      socket.off('diceRolled', onDice)
    }
  }, [socket, setState, pushLog, state, roomId])

  const roll = () => {
    if (!roomId) return
    socket?.emit('rollDice', { roomId })
  }

  const endTurn = () => {
    if (!roomId) return
    socket?.emit('endTurn', { roomId })
  }

  const board = state?.board || []
  const players = state?.players || []
  const currentTurn = state?.currentTurn || ''
  const log = state?.log || []

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-[1fr_320px] gap-4">
      {/* 승리 화면 */}
      {winner && <VictoryScreen winner={winner} />}

      {/* 저장/로드 패널 */}
      <SaveLoadPanel roomId={roomId || ''} isGameActive={state !== null} />

      {/* 메인 보드 영역 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            현재 턴: {players.find(p => p.id === currentTurn)?.name || '-'}
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold"
              onClick={() => setShowBuildingModal(true)}
            >
              🏗️ 건설
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
              onClick={() => setShowTradeModal(true)}
            >
              💼 거래
            </button>
            <button
              className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold"
              onClick={() => setShowAssetManager(true)}
            >
              💰 자산
            </button>
            <button className="bg-slate-600 hover:bg-slate-500" onClick={onExit}>나가기</button>
          </div>
        </div>

        <Board board={board} players={players} />

        <div className="flex gap-3">
          <Dice onRoll={roll} dice={dice} />
          <button className="bg-amber-600 hover:bg-amber-500" onClick={endTurn}>턴 종료</button>
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="space-y-4">
        <PlayerPanel players={players} currentTurnId={currentTurn} />
        <GameLogPanel log={log} />
      </div>

      {/* 모달 및 알림 */}
      <BuildingModal isOpen={showBuildingModal} onClose={() => setShowBuildingModal(false)} />
      <TradeModal isOpen={showTradeModal} onClose={() => setShowTradeModal(false)} />
      <AssetManager isOpen={showAssetManager} onClose={() => setShowAssetManager(false)} />
      <TradeNotification />
      
      {/* 승리 화면 */}
      {winner && (
        <VictoryScreen
          winner={winner}
          players={players}
          onClose={() => {
            setWinner(null)
            onExit()
          }}
        />
      )}
    </div>
  )
}
