@echo off
chcp 65001 >nul
SETLOCAL

IF NOT EXIST "node_modules" (
    echo תיקיית node_modules לא נמצאה. מתקינים את כל התלויות...
    npm install
) ELSE (
    echo תיקיית node_modules קיימת. מפעילים את הפרויקט...
)

npm start

ENDLOCAL
pause
