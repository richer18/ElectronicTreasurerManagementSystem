@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "SQL_FILE=%SCRIPT_DIR%setup_full_report_rcd.sql"
set "MYSQL_EXE=D:\WINDOWS_INSTALLED\xampp\mysql\bin\mysql.exe"

if not exist "%SQL_FILE%" (
  echo SQL file not found:
  echo %SQL_FILE%
  pause
  exit /b 1
)

if not exist "%MYSQL_EXE%" (
  echo MySQL executable not found at:
  echo %MYSQL_EXE%
  echo.
  echo Update MYSQL_EXE inside this file if your XAMPP path is different.
  pause
  exit /b 1
)

set /p DB_USERNAME=MySQL username [root]:
if "%DB_USERNAME%"=="" set "DB_USERNAME=root"

set /p DB_PASSWORD=MySQL password [leave blank if none]:

echo.
echo Running full_report_rcd setup on database zamboanguita_taxpayer...
echo.

if "%DB_PASSWORD%"=="" (
  "%MYSQL_EXE%" -u "%DB_USERNAME%" < "%SQL_FILE%"
) else (
  "%MYSQL_EXE%" -u "%DB_USERNAME%" -p"%DB_PASSWORD%" < "%SQL_FILE%"
)

if errorlevel 1 (
  echo.
  echo full_report_rcd setup failed.
  pause
  exit /b 1
)

echo.
echo full_report_rcd setup completed successfully.
pause
