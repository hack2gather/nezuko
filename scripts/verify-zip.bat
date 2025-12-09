@echo off
echo.
echo ====================================
echo   Verifying Plugin Zip Structure
echo ====================================
echo.

if not exist "caido-headers-sidebar.zip" (
    echo ERROR: caido-headers-sidebar.zip not found
    echo Please run: pnpm run release
    exit /b 1
)

echo Checking zip file contents...
echo.

powershell -Command "Add-Type -Assembly System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('%CD%\caido-headers-sidebar.zip'); Write-Host 'Files in zip:'; $zip.Entries | ForEach-Object { Write-Host \"  - $($_.FullName) ($([math]::Round($_.Length/1024,2)) KB)\" }; $zip.Dispose()"

echo.
echo ====================================
echo Expected files (at root level):
echo   - manifest.json
echo   - frontend.js
echo   - backend.js
echo   - styles.css
echo ====================================
echo.

powershell -Command "Add-Type -Assembly System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('%CD%\caido-headers-sidebar.zip'); $hasManifest = $zip.Entries | Where-Object { $_.FullName -eq 'manifest.json' }; $hasFrontend = $zip.Entries | Where-Object { $_.FullName -eq 'frontend.js' }; $hasBackend = $zip.Entries | Where-Object { $_.FullName -eq 'backend.js' }; $hasStyles = $zip.Entries | Where-Object { $_.FullName -eq 'styles.css' }; $zip.Dispose(); if ($hasManifest -and $hasFrontend -and $hasBackend -and $hasStyles) { Write-Host '[OK] All required files present at root level' -ForegroundColor Green; exit 0 } else { Write-Host '[ERROR] Missing required files or files not at root level' -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Zip file structure is correct!
    echo You can now install this in Caido.
) else (
    echo.
    echo [ERROR] Zip file structure is incorrect!
    echo Please run: pnpm run release
)

echo.
pause
