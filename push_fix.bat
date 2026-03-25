@echo off
echo Navigating to project directory...
cd /d "%~dp0"
echo.
echo Adding changes...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo Failed to add files.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo Committing changes...
git commit -m "fix: comprehensive DB schema and rich details"
echo.
echo Pushing to GitHub...
git push origin main
