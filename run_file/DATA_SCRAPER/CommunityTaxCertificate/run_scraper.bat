@echo off
setlocal
python "%~dp0scraper.py" %*
exit /b %errorlevel%
