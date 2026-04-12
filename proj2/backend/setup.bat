@echo off
cd /d "C:\Users\CARLA\Documents\Algorithms\Vibe Code\proj2\backend"

echo ======================================
echo SETUP BACKEND GLOWUP STORE
echo ======================================
echo.

echo [1/4] Limpando arquivos antigos...
del /s /q server.js 2>nul
del /s /q *.log 2>nul
del /s /q config 2>nul
del /s /q controllers 2>nul
del /s /q middleware 2>nul
del /s /q models 2>nul
del /s /q routes 2>nul
rd /s /q config 2>nul
rd /s /q controllers 2>nul
rd /s /q middleware 2>nul
rd /s /q models 2>nul
rd /s /q routes 2>nul

echo [2/4] Movendo novo server...
move server-new.js server.js >nul 2>&1

echo [3/4] Deletando node_modules antigos e package-lock...
rd /s /q node_modules 2>nul
del package-lock.json 2>nul

echo [4/4] Instalando dependências com npm install...
call npm install

echo.
echo ======================================
echo ✅ SETUP COMPLETO!
echo ======================================
echo.
echo Para iniciar o servidor, execute:
echo   npm run dev
echo.
echo Servidor rodará em:
echo   http://localhost:5000
echo.
pause
