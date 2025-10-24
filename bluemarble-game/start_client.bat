@echo off
chcp 65001 > nul
echo ========================================
echo 부루마블 클라이언트 시작
echo ========================================
echo.

cd /d "%~dp0client"

if not exist "node_modules" (
    echo ❌ 패키지가 설치되지 않았습니다!
    echo.
    echo install.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

echo 🚀 클라이언트 시작 중... (포트: 5173)
echo.
echo 브라우저에서 http://localhost:5173 를 열어주세요
echo.
npm run dev
