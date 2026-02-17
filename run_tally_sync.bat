@echo off
cd /d "%~dp0"
echo Starting Tally Sync...
echo Make sure Tally is open and running on localhost:9000
node scripts/tally-sync.mjs
pause
