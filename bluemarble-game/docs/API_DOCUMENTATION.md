# API / Socket 이벤트 개요

서버는 대부분 Socket.io 이벤트로 동작하며, 일부 헬스체크 REST만 제공합니다.

## Socket.io (클라이언트 → 서버)
- createRoom { roomName, playerName, color }
- joinRoom { roomId, playerName, color }
- startGame { roomId }
- rollDice { roomId }
- buyProperty { roomId, propertyId }
- buildBuilding { roomId, propertyId, type }
- endTurn { roomId }

## Socket.io (서버 → 클라이언트)
- roomCreated { roomId, room, player }
- joinSuccess { roomId, player, room }
- playerJoined { player, room }
- gameStarted { gameState }
- diceRolled { playerId, dice: [d1, d2], isDouble }
- gameStateUpdate { gameState }
- propertyBought { playerId, property }
- buildingBuilt { playerId, property }
- turnEnded { playerId, nextPlayerId }
- error { message }

payload 상세는 server/src/services/types.ts 참조.
