@echo off
setlocal

set BASE_DIR=%~dp0
set SCRAPER=%BASE_DIR%scraper.py
set CHECKER1=%BASE_DIR%SCRAPE_CHECKER\SQL_CHECKER_COMMUNITYTAXCERTIFICATE.py
set CHECKER2=%BASE_DIR%SCRAPE_CHECKER\SQL_CHECKER_COMMUNITYTAXCERTIFICATE_2.py

echo ==========================================
echo COMMUNITY TAX CERTIFICATE FULL PROCESS
echo ==========================================
echo.

echo [1/4] Running scraper...
python "%SCRAPER%" %*
if errorlevel 1 (
    echo.
    echo Failed at step 1: scraper
    exit /b 1
)

echo.
echo [2/4] Running SQL_CHECKER_COMMUNITYTAXCERTIFICATE...
python "%CHECKER1%"
if errorlevel 1 (
    echo.
    echo Failed at step 2: SQL_CHECKER_COMMUNITYTAXCERTIFICATE
    exit /b 1
)

echo.
echo [3/4] Running SQL_CHECKER_COMMUNITYTAXCERTIFICATE_2...
python "%CHECKER2%"
if errorlevel 1 (
    echo.
    echo Failed at step 3/4: SQL_CHECKER_COMMUNITYTAXCERTIFICATE_2 or MySQL import
    exit /b 1
)

echo.
echo ==========================================
echo ALL STEPS COMPLETED SUCCESSFULLY
echo ==========================================
exit /b 0
