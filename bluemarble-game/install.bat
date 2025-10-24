@echo off
chcp 65001 > nul
echo ========================================
echo 부루마블 게임 - 자동 설치 스크립트
echo ========================================
echo.

REM Node.js 확인
echo [1/4] Node.js 확인 중...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js가 설치되어 있지 않습니다!
    echo.
    echo 📥 Node.js를 설치해주세요:
    echo    https://nodejs.org/
    echo.
    echo    LTS 버전 다운로드 → 설치 → 터미널 재시작
    echo.
    pause
    exit /b 1
)

node --version
npm --version
echo ✅ Node.js 설치됨

echo.
echo [2/4] 클라이언트 패키지 설치 중...
cd /d "%~dp0client"
if not exist "package.json" (
    echo ❌ client/package.json을 찾을 수 없습니다!
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo ❌ 클라이언트 설치 실패
    pause
    exit /b 1
)
echo ✅ 클라이언트 설치 완료

echo.
echo [3/4] 서버 패키지 설치 중...
cd /d "%~dp0server"
if not exist "package.json" (
    echo ❌ server/package.json을 찾을 수 없습니다!
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo ❌ 서버 설치 실패
    pause
    exit /b 1
)
echo ✅ 서버 설치 완료

echo.
echo [4/4] 설치 완료!
echo.
echo ========================================
echo 🎉 설치가 완료되었습니다!
echo ========================================
echo.
echo 📝 다음 단계:
echo.
echo 1. 서버 실행:
echo    start_server.bat
echo.
echo 2. 클라이언트 실행 (새 터미널):
echo    start_client.bat
echo.
echo 3. 브라우저에서 접속:
echo    http://localhost:5173
echo.
pause
