@echo off
setlocal
call "%~dp0run_full_process.bat" %*
exit /b %errorlevel%
