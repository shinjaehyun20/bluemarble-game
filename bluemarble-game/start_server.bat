@echo off
chcp 65001 > nul
echo ========================================
echo 부루마블 서버 시작
echo ========================================
echo.

cd /d "%~dp0server"

if not exist "node_modules" (
    echo ❌ 패키지가 설치되지 않았습니다!
    echo.
    echo install.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

echo 🚀 서버 시작 중... (포트: 3001)
echo.
npm run dev
