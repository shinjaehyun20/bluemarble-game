import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const initiated = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    const url = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
    console.log('[useSocket] 소켓 연결 시도:', url)
    const s = io(url, { withCredentials: true })
    
    s.on('connect', () => {
      console.log('[useSocket] 소켓 연결 성공:', s.id)
    })
    
    s.on('disconnect', () => {
      console.log('[useSocket] 소켓 연결 해제')
    })
    
    s.on('connect_error', (error) => {
      console.error('[useSocket] 소켓 연결 에러:', error)
    })
    
    setSocket(s)
    return () => { s.close() }
  }, [])

  return socket
}

export default useSocket
