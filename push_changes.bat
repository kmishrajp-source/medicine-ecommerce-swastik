
@echo off
set GIT_PATH="C:\Users\hp\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"

echo Initializing Git repository...
%GIT_PATH% init
%GIT_PATH% add .
%GIT_PATH% commit -m "feat: Add WhatsApp order button"
echo.
echo Linking to remote repository...
%GIT_PATH% remote add origin https://github.com/kmishrajp-source/medicine-ecommerce-swastik.git
REM If remote already exists, update it just in case
%GIT_PATH% remote set-url origin https://github.com/kmishrajp-source/medicine-ecommerce-swastik.git
echo.
echo Renaming branch to main...
%GIT_PATH% branch -M main
echo.
echo Pushing changes to GitHub...
%GIT_PATH% push -u origin main
echo.
echo Done! You can verify the deployment on Vercel now.
pause
