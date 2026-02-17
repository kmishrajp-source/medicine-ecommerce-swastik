@echo off
cd /d "%~dp0"
set GIT_PATH="C:\Users\hp\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"

echo checking for git...
if not exist %GIT_PATH% (
    echo Git not found at expected path. Trying simply 'git'.
    set GIT_PATH=git
)

echo.
echo Initializing/Reinitializing git...
%GIT_PATH% init

echo.
echo Adding all files...
%GIT_PATH% add .

echo.
echo Committing changes...
%GIT_PATH% commit -m "feat: Fix deployment and add WhatsApp button"

echo.
echo Setting remote URL to ensure it points to the correct repo...
%GIT_PATH% remote add origin https://github.com/kmishrajp-source/medicine-ecommerce-swastik.git
%GIT_PATH% remote set-url origin https://github.com/kmishrajp-source/medicine-ecommerce-swastik.git

echo.
echo Fetching latest from remote...
%GIT_PATH% fetch origin

echo.
echo Attempting to push to main...
%GIT_PATH% push origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo Push failed. This usually happens if your local history doesn't match the remote history 
    echo (e.g. you downloaded the code as a zip but the remote has history).
    echo.
    echo If you want to FORCE overwrite the website with your current local files, type 'Y'.
    echo WARNING: This will overwrite any changes on the remote that are not on your computer.
    echo ========================================================
    set /p choice="Do you want to force push? (Y/N): "
    if /i "%choice%"=="Y" (
        echo.
        echo Force pushing...
        %GIT_PATH% push -f origin main
        if %errorlevel% equ 0 (
            echo. 
            echo Force push successful! Check Vercel for new deployment.
        ) else (
            echo.
            echo Force push failed. Please check your internet or permissions.
        )
    ) else (
        echo.
        echo trying git pull --rebase...
        %GIT_PATH% pull origin main --rebase
        echo.
        echo Please resolve conflicts if any, and try pushing again.
    )
) else (
    echo.
    echo Push successful! Check Vercel for new deployment.
)

pause
