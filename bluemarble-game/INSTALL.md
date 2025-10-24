# 부루마블 게임 - 설치 가이드

## 🚨 Node.js 설치 필수

이 프로젝트는 Node.js와 npm이 필요합니다.

### 1. Node.js 설치

**Windows:**
1. [Node.js 공식 사이트](https://nodejs.org/) 방문
2. **LTS 버전** (권장) 다운로드
3. 설치 프로그램 실행
4. 설치 완료 후 PowerShell/CMD 재시작

**설치 확인:**
```bash
node --version   # v18.0.0 이상
npm --version    # v9.0.0 이상
```

---

## 🚀 프로젝트 설치

### Client (프론트엔드)

```bash
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game\client"
npm install
```

**설치되는 패키지:**
- ✅ React 18.3.1
- ✅ React DOM 18.3.1
- ✅ Socket.io Client
- ✅ Zustand (상태 관리)
- ✅ Framer Motion (애니메이션)
- ✅ Vite (빌드 도구)
- ✅ TypeScript
- ✅ Tailwind CSS

### Server (백엔드)

```bash
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game\server"
npm install
```

**설치되는 패키지:**
- ✅ Express
- ✅ Socket.io
- ✅ MongoDB/Mongoose
- ✅ TypeScript
- ✅ 기타 필수 패키지

---

## 🎮 실행 방법

### 개발 모드 (권장)

#### 1. 서버 실행
```bash
cd server
npm run dev
```
→ http://localhost:3001 에서 실행

#### 2. 클라이언트 실행 (새 터미널)
```bash
cd client
npm run dev
```
→ http://localhost:5173 에서 실행

### 프로덕션 빌드

#### 클라이언트 빌드
```bash
cd client
npm run build
```

#### 서버 빌드
```bash
cd server
npm run build
npm start
```

---

## 🐳 Docker 실행 (대안)

Node.js 설치 없이 Docker만 있으면 실행 가능:

```bash
cd "e:\dev aug\pythonw\toyproject\03-부루마블-보드게임-웹\bluemarble-game"
docker-compose up
```

**필요사항:**
- Docker Desktop 설치
- docker-compose.yml 파일 존재

---

## 🛠️ 문제 해결

### "npm을 찾을 수 없습니다"
**원인:** Node.js 미설치
**해결:** Node.js 설치 후 터미널 재시작

### "React 모듈을 찾을 수 없습니다"
**원인:** npm install 미실행
**해결:**
```bash
cd client
npm install
```

### "포트가 이미 사용 중입니다"
**서버 포트 변경:**
```bash
# server/.env 파일 수정
PORT=3002
```

**클라이언트 포트 변경:**
```bash
# client/vite.config.ts 수정
server: { port: 5174 }
```

### TypeScript 오류
```bash
# 타입 정의 재설치
npm install --save-dev @types/react @types/react-dom
```

---

## 📋 시스템 요구사항

- **Node.js:** v18.0.0 이상
- **npm:** v9.0.0 이상
- **RAM:** 최소 4GB (권장 8GB)
- **디스크:** 최소 500MB

---

## 📞 다음 단계

1. ✅ Node.js 설치
2. ✅ `npm install` (client + server)
3. ✅ MongoDB 설정 (선택사항)
4. ✅ `npm run dev` 실행
5. ✅ 브라우저에서 http://localhost:5173 접속

---

## 🎯 빠른 명령어 모음

```bash
# 전체 설치 (client + server)
cd client && npm install && cd ../server && npm install

# 전체 실행 (개발 모드)
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# 전체 빌드 (프로덕션)
cd client && npm run build && cd ../server && npm run build
```

---

**🎲 설치 후 게임을 즐기세요!**
