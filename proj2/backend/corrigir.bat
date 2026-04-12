@echo off
REM Script para corrigir erro de npm install

echo ======================================
echo CORRIGINDO INSTALACAO DO BACKEND
echo ======================================
echo.

cd /d "C:\Users\CARLA\Documents\Algorithms\Vibe Code\proj2\backend"

echo [1/5] Limpando npm cache...
call npm cache clean --force

echo [2/5] Removendo node_modules...
rd /s /q node_modules 2>nul

echo [3/5] Removendo package-lock.json...
del package-lock.json 2>nul

echo [4/5] Atualizando npm para versao mais recente...
call npm install -g npm@latest

echo [5/5] Instalando dependencias com versoes fixas...
call npm install

echo.
echo ======================================
echo ✅ INSTALACAO COMPLETA!
echo ======================================
echo.
echo Para iniciar o servidor, execute:
echo   npm run dev
echo.
echo Servidor rodará em:
echo   http://localhost:5000
echo.
pause
