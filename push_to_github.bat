@echo off
title Push Team Availability Tracker to GitHub
color 0A
echo ========================================================
echo     PUSHING TEAM AVAILABILITY TRACKER TO GITHUB
echo ========================================================
echo.
cd /d "%~dp0"

echo Remote Repository:
git remote -v
echo.
echo Pushing branch 'main' to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Project pushed successfully to GitHub!
    echo   Visit: https://github.com/lavach02-arch/team-availability-tracker
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   NOTE: If it says 'Repository not found',
    echo   Please create the empty repository first on GitHub:
    echo   1. Open: https://github.com/new
    echo   2. Repository name: team-availability-tracker
    echo   3. Click 'Create repository'
    echo   4. Run this script again!
    echo ========================================================
)
echo.
pause
