@echo off
echo.
echo ====================================
echo   Packaging Caido Plugin
echo ====================================
echo.

REM Clean up old files
if exist "package" rmdir /s /q "package"
if exist "caido-headers-sidebar.zip" del /f "caido-headers-sidebar.zip"

REM Create package directory
mkdir package

echo Copying files...
copy "manifest.json" "package\manifest.json" >nul
copy "dist\frontend.js" "package\frontend.js" >nul
copy "dist\backend.js" "package\backend.js" >nul
copy "dist\styles.css" "package\styles.css" >nul

if not exist "package\manifest.json" (
    echo ERROR: Failed to copy files. Did you run 'pnpm run build' first?
    exit /b 1
)

echo   [OK] manifest.json
echo   [OK] frontend.js
echo   [OK] backend.js
echo   [OK] styles.css
echo.

echo Creating zip file...
powershell -Command "Compress-Archive -Path 'package\*' -DestinationPath 'caido-headers-sidebar.zip' -Force"

if exist "caido-headers-sidebar.zip" (
    echo.
    echo ====================================
    echo   SUCCESS!
    echo ====================================
    echo.
    echo Plugin packaged: caido-headers-sidebar.zip
    echo.
    echo To install in Caido:
    echo 1. Open Caido
    echo 2. Go to Settings ^> Plugins
    echo 3. Click "Install from file"
    echo 4. Select caido-headers-sidebar.zip
    echo.

    REM Clean up
    rmdir /s /q "package"
) else (
    echo ERROR: Failed to create zip file
    exit /b 1
)

pause
