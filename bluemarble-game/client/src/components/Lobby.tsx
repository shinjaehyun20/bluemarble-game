import { useEffect, useState } from 'react'
import useSocket from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

export default function Lobby({ onEntered }: { onEntered: () => void }) {
  const socket = useSocket()
  const { setRoom, setMe } = useGameStore()
  const [name, setName] = useState('플레이어1')
  const [color, setColor] = useState<'red'|'blue'|'yellow'|'green'|'purple'>('red')
  const [roomName, setRoomName] = useState('친구들과 게임')

  useEffect(() => {
    if (!socket) return
    const roomCreated = (data: any) => {
      setRoom(data.roomId)
      setMe({ id: data.player.id, name: data.player.name, color: data.player.color, cash: data.player.cash, position: 0 })
      onEntered()
    }
    socket.on('roomCreated', roomCreated)
    socket.on('joinSuccess', (payload: any) => {
      setRoom(payload.roomId)
      setMe(payload.player)
      onEntered()
    })
    return () => {
      socket.off('roomCreated', roomCreated)
      socket.off('joinSuccess')
    }
  }, [socket])

  const createRoom = () => {
    console.log('[Lobby] 방 만들기 버튼 클릭됨')
    console.log('[Lobby] 소켓 연결 상태:', socket ? '연결됨' : '연결안됨')
    if (socket) {
      console.log('[Lobby] createRoom 이벤트 전송:', { roomName, playerName: name, color })
      socket.emit('createRoom', { roomName, playerName: name, color })
    } else {
      console.error('[Lobby] 소켓이 연결되지 않았습니다!')
    }
  }

  const joinRoom = () => {
    console.log('[Lobby] 방 입장 버튼 클릭됨')
    console.log('[Lobby] 소켓 연결 상태:', socket ? '연결됨' : '연결안됨')
    const roomId = prompt('입장할 방 ID를 입력하세요')
    if (!roomId) return
    if (socket) {
      console.log('[Lobby] joinRoom 이벤트 전송:', { roomId, playerName: name, color })
      socket.emit('joinRoom', { roomId, playerName: name, color })
    } else {
      console.error('[Lobby] 소켓이 연결되지 않았습니다!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-extrabold">🎲 세계여행 부루마블</h1>
      <div className="bg-slate-800 p-4 rounded-md space-y-3">
        <div className="flex gap-3">
          <input className="flex-1 px-3 py-2 rounded bg-slate-700" value={name} onChange={e=>setName(e.target.value)} placeholder="이름(최대 10자)" />
          <select className="px-3 py-2 rounded bg-slate-700" value={color} onChange={e=>setColor(e.target.value as any)}>
            <option value="red">빨강</option>
            <option value="blue">파랑</option>
            <option value="yellow">노랑</option>
            <option value="green">초록</option>
            <option value="purple">보라</option>
          </select>
        </div>
        <div className="flex gap-3">
          <input className="flex-1 px-3 py-2 rounded bg-slate-700" value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="방 이름" />
        </div>
        <div className="flex gap-3">
          <button onClick={createRoom}>방 만들기</button>
          <button className="bg-emerald-600 hover:bg-emerald-500" onClick={joinRoom}>방 입장</button>
        </div>
      </div>
    </div>
  )
}
