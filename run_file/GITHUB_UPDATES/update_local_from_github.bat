@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 git_sync.py pull
) else (
  python git_sync.py pull
)
pause
