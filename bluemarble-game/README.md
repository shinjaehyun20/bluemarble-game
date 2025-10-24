# 세계여행 부루마블 (World Tour Blue Marble)

웹 기반 실시간 멀티플레이 부루마블 보드게임. React + TypeScript (클라이언트), Node.js + Express + Socket.io + MongoDB (서버).

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js** v18.0.0 이상 ([다운로드](https://nodejs.org/))
- npm v9.0.0 이상

### 자동 설치 및 실행 (Windows)
```bash
# 1. 패키지 설치 (처음 1회만)
install.bat

# 2. 서버 실행
start_server.bat

# 3. 클라이언트 실행 (새 터미널)
start_client.bat

# 4. 브라우저에서 http://localhost:5173 접속
```

### 수동 설치
```bash
# 클라이언트
cd client
npm install
npm run dev

# 서버 (새 터미널)
cd server
npm install
npm run dev
```

📖 자세한 설치 방법은 [INSTALL.md](INSTALL.md) 참고

## 주요 특징
- 1~5인 멀티플레이, 방 생성/입장
- 서버 권위 게임 로직: 주사위/이동/더블(3연속→무인도)/무인도 대기/월급/통행료/구매
- 황금열쇠 랜덤 이벤트(간이 구현)
- 실시간 상태 동기화(WebSocket), 게임 로그 표시
- Tailwind CSS + Framer Motion 애니메이션
- 플레이어 패널, 보드 그리드(11열), 주사위 애니메이션

## 구현 현황
✅ 완료:
- 프로젝트 스캐폴딩(클라/서버/도커)
- **핵심 게임 로직**: 주사위/이동/더블/3연속더블→무인도/무인도 대기/월급/통행료 자동 지불/땅 구매
- **황금열쇠 전체 시스템**: 20종 카드 전체 구현, 덱 순환, 복지기금 풀 처리
- **건물 시스템**: 색 그룹 완성 확인, 빌라/빌딩/호텔 레벨별 통행료(0.5x/2x/5x), 건설 비용 차감, 강제 매각
- **거래 시스템**: 플레이어 간 현금+부동산 거래, 제안/수락/거절, 실시간 알림
- **파산/승리**: 자산 이전, 최후 1인 승리, 순위 화면
- **UI 컴포넌트**: 보드(40칸), 주사위 애니메이션, 플레이어 패널, 게임 로그, 건설/거래/자산관리 모달, 승리 화면
- 턴 종료 버튼, Lobby → WaitingRoom → GameBoard 화면 전환

⏳ 예정:
- 경매 시스템 (부동산 거절 시)
- AI 플레이어 (쉬움/보통/어려움)
- 게임 상태 저장/복구(MongoDB)
- 채팅/관전 모드
- 토큰 이동 경로 애니메이션, 카드 뒤집기 효과

## 폴더 구조
```
bluemarble-game/
  client/   # React 18 + TS + Vite + Tailwind + Framer Motion
  server/   # Express + Socket.io + Mongoose + TS
  docs/     # API/규칙/가이드
  docker-compose.yml
  README.md
```

## 빠른 시작 (개발)

### 필요 환경
- Node.js LTS (v18+)
- Docker + Docker Compose (서버 실행 시 권장)

### 1. 서버 실행 (Docker 권장)
MongoDB와 서버를 도커로 한 번에 실행:
```powershell
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game"
docker compose up -d --build
```
- 서버: http://localhost:4000
- MongoDB: mongodb://localhost:27017

### 2. 클라이언트 실행 (로컬 Vite)
```powershell
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game\client"
npm install
npm run dev
```
브라우저에서 http://localhost:5173 접속

### 서버 로컬 실행 (대안)
도커 대신 로컬로 서버 실행 시:
```powershell
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game\server"
npm install
npm run dev
```
MongoDB는 별도 로컬 설치 필요(`mongodb://localhost:27017/bluemarble`)

## 환경변수
`server/.env` (예시는 `.env.example` 참조):
```
MONGODB_URI=mongodb://mongo:27017/bluemarble
SESSION_SECRET=bluemarble-secret-key-2024
PORT=4000
CORS_ORIGINS=["http://localhost:5173"]
```

## 플레이 가이드
1. 로비에서 이름/색상 입력 후 "방 만들기" 클릭
2. 대기실에서 "게임 시작" (다른 플레이어 입장 대기 가능)
3. 게임보드:
   - "🎲 주사위 굴리기" → 자동 이동/이벤트 처리
   - 더블 시 한 번 더, 3연속 더블 → 무인도(3턴)
   - 출발 통과/도착 시 월급 +20만원
   - 빈 땅 도착 시 구매 가능(별도 UI는 추후)
   - 다른 플레이어 땅 도착 시 통행료 자동 지불
   - "턴 종료" 버튼으로 수동 턴 넘김

## 문서
- 상세 규칙: `docs/bluemarble-game-complete-spec.md`
- API 이벤트: `docs/API_DOCUMENTATION.md`
- 사용자 가이드: `docs/USER_GUIDE.md`

## 라이선스
데모/학습용. 상업적 사용 시 별도 확인 필요.
