@echo off
cd /d "%~dp0"
echo Synchronizing database schema with Supabase...
echo.
call npx prisma db push
echo.
echo ==============================================================
echo If the command above says "The database is already in sync" 
echo or shows a green success message, the issue is fixed!
echo If there is a red error, please show me the error.
echo ==============================================================
pause
