import React from 'react'
import useSocket from '../hooks/useSocket'

interface SaveLoadPanelProps {
  roomId: string
  isGameActive: boolean
}

export const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({ roomId, isGameActive }) => {
  const socket = useSocket()
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    if (!socket) return
    

    const handleGameSaved = ({ message }: { message: string }) => {
      setMessage(message)
      setTimeout(() => setMessage(''), 3000)
    }

    const handleGameLoaded = ({ message }: { message: string }) => {
      setMessage(message)
      setTimeout(() => setMessage(''), 3000)
    }

    const handleReconnected = ({ message }: { message: string }) => {
      setMessage(message)
      setTimeout(() => setMessage(''), 3000)
    }

    const handleError = ({ message }: { message: string }) => {
      setMessage(`오류: ${message}`)
      setTimeout(() => setMessage(''), 5000)
    }

    socket.on('gameSaved', handleGameSaved)
    socket.on('gameLoaded', handleGameLoaded)
    socket.on('reconnected', handleReconnected)
    socket.on('error', handleError)

    return () => {
      socket.off('gameSaved', handleGameSaved)
      socket.off('gameLoaded', handleGameLoaded)
      socket.off('reconnected', handleReconnected)
      socket.off('error', handleError)
    }
  }, [socket])

  const handleSaveGame = () => {
    if (!socket) return
    if (!isGameActive) {
      setMessage('게임이 진행 중일 때만 저장할 수 있습니다')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    socket.emit('saveGame', { roomId })
  }

  const handleLoadGame = () => {
    if (!socket) return
    socket.emit('loadGame', { roomId })
  }

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minWidth: '150px'
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>게임 관리</h3>
      
      <button
        onClick={handleSaveGame}
        disabled={!isGameActive}
        style={{
          padding: '8px 12px',
          background: isGameActive ? '#4CAF50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isGameActive ? 'pointer' : 'not-allowed',
          fontSize: '13px'
        }}
      >
        💾 게임 저장
      </button>

      <button
        onClick={handleLoadGame}
        style={{
          padding: '8px 12px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        📁 게임 불러오기
      </button>

      {message && (
        <div style={{
          padding: '8px',
          background: message.includes('오류') ? '#ffebee' : '#e8f5e9',
          color: message.includes('오류') ? '#c62828' : '#2e7d32',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <div style={{
        fontSize: '11px',
        color: '#666',
        marginTop: '5px',
        padding: '8px',
        background: '#f5f5f5',
        borderRadius: '4px'
      }}>
        💡 게임은 3분마다 자동으로 저장됩니다
      </div>
    </div>
  )
}
