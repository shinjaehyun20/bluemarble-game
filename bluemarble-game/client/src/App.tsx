import { useEffect, useState } from 'react'
import Lobby from './components/Lobby'
import WaitingRoom from './components/WaitingRoom'
import GameBoard from './components/GameBoard'
import useSocket from './hooks/useSocket'

export default function App() {
  const socket = useSocket()
  const [view, setView] = useState<'lobby'|'waiting'|'game'>('lobby')

  useEffect(() => {
    if (!socket) return
    socket.on('gameStarted', () => setView('game'))
    socket.on('roomCreated', () => setView('waiting'))
    socket.on('playerJoined', () => setView('waiting'))
    return () => {
      socket.off('gameStarted')
      socket.off('roomCreated')
      socket.off('playerJoined')
    }
  }, [socket])

  return (
    <div className="min-h-screen p-4">
      {view === 'lobby' && <Lobby onEntered={() => setView('waiting')} />}
      {view === 'waiting' && <WaitingRoom onStart={() => setView('game')} onBack={() => setView('lobby')} />}
      {view === 'game' && <GameBoard onExit={() => setView('lobby')} />}
    </div>
  )
}
