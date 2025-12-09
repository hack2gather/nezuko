#!/bin/bash

echo ""
echo "===================================="
echo "  Packaging Caido Plugin"
echo "===================================="
echo ""

# Clean up old files
rm -rf package
rm -f caido-headers-sidebar.zip

# Create package directory
mkdir -p package

echo "Copying files..."
cp manifest.json package/manifest.json
cp dist/frontend.js package/frontend.js
cp dist/backend.js package/backend.js
cp dist/styles.css package/styles.css

if [ ! -f "package/manifest.json" ]; then
    echo "ERROR: Failed to copy files. Did you run 'pnpm run build' first?"
    exit 1
fi

echo "  ✓ manifest.json"
echo "  ✓ frontend.js"
echo "  ✓ backend.js"
echo "  ✓ styles.css"
echo ""

echo "Creating zip file..."
cd package && zip -r ../caido-headers-sidebar.zip . && cd ..

if [ -f "caido-headers-sidebar.zip" ]; then
    echo ""
    echo "===================================="
    echo "  SUCCESS!"
    echo "===================================="
    echo ""
    echo "Plugin packaged: caido-headers-sidebar.zip"
    echo ""
    echo "To install in Caido:"
    echo "1. Open Caido"
    echo "2. Go to Settings > Plugins"
    echo "3. Click 'Install from file'"
    echo "4. Select caido-headers-sidebar.zip"
    echo ""

    # Show contents
    echo "Package contents:"
    unzip -l caido-headers-sidebar.zip
    echo ""

    # Clean up
    rm -rf package
else
    echo "ERROR: Failed to create zip file"
    exit 1
fi
