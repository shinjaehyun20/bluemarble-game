import React from 'react'
import useSocket from '../hooks/useSocket'

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
}

interface ChatPanelProps {
  roomId: string
  playerId: string
  playerName: string
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, playerId, playerName }) => {
  const socket = useSocket()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!socket) return
    
    // 채팅 내역 로드
    socket.emit('loadChatHistory', { roomId })

    const handleChatHistory = ({ messages: historyMessages }: { messages: ChatMessage[] }) => {
      setMessages(historyMessages)
    }

    const handleChatMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
    }

    socket.on('chatHistory', handleChatHistory)
    socket.on('chatMessage', handleChatMessage)

    return () => {
      socket.off('chatHistory', handleChatHistory)
      socket.off('chatMessage', handleChatMessage)
    }
  }, [socket, roomId])

  React.useEffect(() => {
    // 새 메시지 도착 시 스크롤 하단으로
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !inputMessage.trim()) return

    socket.emit('sendChatMessage', {
      roomId,
      playerId,
      playerName,
      message: inputMessage.trim()
    })

    setInputMessage('')
  }

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '300px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* 채팅 헤더 */}
      <div style={{
        padding: '12px 16px',
        background: '#3b82f6',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        💬 채팅
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.playerId === playerId ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              background: msg.playerId === playerId ? '#dcfce7' : '#f3f4f6',
              padding: '8px 12px',
              borderRadius: '8px',
              wordBreak: 'break-word'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 'bold'
              }}>
                {msg.playerName}
              </div>
              <div style={{ fontSize: '13px' }}>{msg.message}</div>
              <div style={{
                fontSize: '10px',
                color: '#999',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 폼 */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          padding: '12px',
          borderTop: '1px solid #e5e7eb',
          gap: '8px'
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          maxLength={200}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          style={{
            padding: '8px 16px',
            background: inputMessage.trim() ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          전송
        </button>
      </form>
    </div>
  )
}
