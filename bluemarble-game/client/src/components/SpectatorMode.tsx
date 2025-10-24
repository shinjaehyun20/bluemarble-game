import React from 'react'
import useSocket from '../hooks/useSocket'

interface SpectatorModeProps {
  roomId: string
  spectatorName: string
  onExit: () => void
}

export const SpectatorMode: React.FC<SpectatorModeProps> = ({ roomId, spectatorName, onExit }) => {
  const socket = useSocket()
  const [gameState, setGameState] = React.useState<any>(null)
  const [spectators, setSpectators] = React.useState<Array<{ id: string; name: string }>>([])

  React.useEffect(() => {
    if (!socket) return
    
    // 관전자로 입장
    socket.emit('joinAsSpectator', { roomId, spectatorName })

    const handleGameStateUpdate = ({ gameState: state }: { gameState: any }) => {
      setGameState(state)
    }

    const handleJoinedAsSpectator = () => {
      console.log('관전 모드로 입장')
    }

    const handleSpectatorJoined = ({ spectator }: { spectator: { id: string; name: string } }) => {
      setSpectators(prev => [...prev, spectator])
    }

    const handleError = ({ message }: { message: string }) => {
      alert(message)
      onExit()
    }

    socket.on('gameStateUpdate', handleGameStateUpdate)
    socket.on('joinedAsSpectator', handleJoinedAsSpectator)
    socket.on('spectatorJoined', handleSpectatorJoined)
    socket.on('error', handleError)

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate)
      socket.off('joinedAsSpectator', handleJoinedAsSpectator)
      socket.off('spectatorJoined', handleSpectatorJoined)
      socket.off('error', handleError)
    }
  }, [socket, roomId, spectatorName, onExit])

  if (!gameState) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          로딩 중...
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentTurn)

  return (
    <div style={{
      padding: '20px',
      background: '#f3f4f6',
      minHeight: '100vh'
    }}>
      {/* 관전 모드 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            👁️ 관전 모드
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {spectatorName} · 방 코드: {roomId}
          </div>
        </div>
        <button
          onClick={onExit}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          나가기
        </button>
      </div>

      {/* 현재 턴 정보 */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          현재 턴: {currentPlayer?.name || '-'}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          위치: {currentPlayer?.position || 0} · 현금: ₩{currentPlayer?.cash.toLocaleString() || 0}
        </div>
      </div>

      {/* 플레이어 목록 */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
          플레이어 ({gameState.players.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {gameState.players.map((player: any) => (
            <div
              key={player.id}
              style={{
                padding: '12px',
                background: player.id === gameState.currentTurn ? '#f0fdf4' : '#f9fafb',
                borderRadius: '6px',
                border: player.id === gameState.currentTurn ? '2px solid #10b981' : '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {player.name} {player.bankrupt && '(파산)'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  위치: {player.position}
                </div>
              </div>
              <div style={{
                fontWeight: 'bold',
                color: player.bankrupt ? '#ef4444' : '#10b981',
                fontSize: '14px'
              }}>
                ₩{player.cash.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 관전자 목록 */}
      {spectators.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
            관전자 ({spectators.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {spectators.map((spectator) => (
              <div
                key={spectator.id}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  borderRadius: '16px',
                  fontSize: '13px'
                }}
              >
                👁️ {spectator.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
