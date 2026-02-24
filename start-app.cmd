@echo off
cd /d "%~dp0"
echo Starting Placement Readiness Platform...
echo.
if not exist "node_modules" (
  echo First run: Installing dependencies...
  call npm install
  echo.
)
start http://localhost:3001
call npm start
