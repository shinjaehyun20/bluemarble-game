# 사용자 가이드 (개발용)

1) 서버 실행
- 로컬: server 폴더에서 `npm install` 후 `npm run dev`
- Docker: 루트에서 `docker compose up -d --build`

2) 클라이언트 실행
- client 폴더에서 `npm install` 후 `npm run dev`
- 브라우저 http://localhost:5173 접속

3) 플레이 흐름
- 로비에서 이름/색상 입력 후 방 만들기 → 대기실 → 게임 시작
- 게임보드에서 🎲 주사위 굴리기 → 이동/이벤트 → 필요 시 구매/건물/턴 종료

주의: 현재는 간이 룰/UI입니다. spec의 전체 룰은 순차 반영됩니다.
