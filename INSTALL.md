# Installation Guide

This guide will help you build and install the Caido Headers & Cookies Manager plugin.

## Quick Start (Recommended)

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Build and Package

**Option A: One Command (Recommended)**
```bash
pnpm run release
```

This will build and package the plugin automatically, creating `caido-headers-sidebar.zip`.

**Option B: Separate Commands**
```bash
# Build the plugin
pnpm run build

# Package into zip
pnpm run package
```

### Step 3: Install in Caido

1. Open Caido
2. Go to **Settings** → **Plugins**
3. Click **"Install from file"** or similar option
4. Select the `caido-headers-sidebar.zip` file
5. The plugin should now appear in your sidebar!

---

## Platform-Specific Instructions

### Windows

**Method 1: Using pnpm (Recommended)**
```cmd
pnpm run release
```

**Method 2: Using Batch Script**
```cmd
scripts\package.bat
```

**Method 3: Manual**
1. Run `pnpm run build`
2. Create a new zip file
3. Add these files to the ROOT of the zip (not in a folder):
   - `manifest.json`
   - `dist/frontend.js` (rename to `frontend.js`)
   - `dist/backend.js` (rename to `backend.js`)
   - `dist/styles.css` (rename to `styles.css`)
4. Name it `caido-headers-sidebar.zip`

### macOS / Linux

**Method 1: Using pnpm (Recommended)**
```bash
pnpm run release
```

**Method 2: Using Shell Script**
```bash
bash scripts/package.sh
```

**Method 3: Using npm script**
```bash
pnpm run package:unix
```

---

## Verifying the Package

After creating the zip file, verify its structure:

**Windows (PowerShell):**
```powershell
Add-Type -Assembly System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::OpenRead("$PWD\caido-headers-sidebar.zip").Entries.Name
```

**macOS / Linux:**
```bash
unzip -l caido-headers-sidebar.zip
```

**Expected output:**
```
manifest.json
frontend.js
backend.js
styles.css
```

**IMPORTANT:** The files must be at the ROOT of the zip, NOT inside a folder!

❌ **Wrong structure:**
```
caido-headers-sidebar.zip
└── caido-headers-sidebar/
    ├── manifest.json
    ├── frontend.js
    ├── backend.js
    └── styles.css
```

✅ **Correct structure:**
```
caido-headers-sidebar.zip
├── manifest.json
├── frontend.js
├── backend.js
└── styles.css
```

---

## Troubleshooting

### Error: "Invalid plugin manifest.json file"

**Cause:** The zip file structure is incorrect.

**Solution:**
1. Delete the old zip file
2. Run `pnpm run release` again
3. Verify the zip structure (see above)
4. If still having issues, extract the zip and check if files are at the root

### Error: "No matching version found for @caido/sdk-backend"

**Solution:**
```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Could not resolve 'react'"

**Cause:** Build configuration issue.

**Solution:**
```bash
# Pull latest changes
git pull

# Rebuild
pnpm run clean
pnpm run build
```

### Build files not found when packaging

**Solution:**
```bash
# Make sure you build first
pnpm run build

# Then package
pnpm run package
```

Or use the combined command:
```bash
pnpm run release
```

---

## Development Workflow

### Building during development

```bash
# Build once
pnpm run build

# Watch mode (auto-rebuild on changes)
pnpm run watch
```

### Testing your changes

1. Make code changes in `src/`
2. Run `pnpm run build`
3. Reload the plugin in Caido
4. Test the functionality

### Creating a release

```bash
# Full release (build + package)
pnpm run release

# Clean everything first
pnpm run clean
pnpm run release
```

---

## File Structure

```
caido-headers-sidebar-plugin/
├── manifest.json              # Plugin metadata (required in zip)
├── src/
│   ├── frontend/
│   │   └── index.tsx          # Frontend source code
│   └── backend/
│       └── index.ts           # Backend source code
├── dist/                      # Build output
│   ├── frontend.js            # Compiled frontend (goes in zip)
│   ├── backend.js             # Compiled backend (goes in zip)
│   └── styles.css             # Styles (goes in zip)
├── scripts/
│   ├── package.js             # Cross-platform packaging script
│   ├── package.bat            # Windows batch script
│   └── package.sh             # Unix shell script
└── caido-headers-sidebar.zip  # Final package for Caido
```

---

## What Gets Packaged

Only these files are included in the zip:

1. **manifest.json** - Plugin configuration
2. **frontend.js** - Compiled React UI
3. **backend.js** - Compiled Node.js backend
4. **styles.css** - CSS styling

Everything else (source files, node_modules, etc.) is excluded.

---

## Clean Up

To remove build artifacts:

```bash
# Remove all build files and packages
pnpm run clean

# Or manually
rm -rf dist package caido-headers-sidebar.zip
```

---

## Need Help?

- Check the main [README.md](README.md) for usage instructions
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Report issues on GitHub
- Check Caido's official plugin documentation

---

## Summary Commands

```bash
# Install dependencies
pnpm install

# Build + Package + Install
pnpm run release                           # Creates caido-headers-sidebar.zip
# Then install the zip file in Caido

# For development
pnpm run watch                             # Auto-rebuild on changes

# Clean up
pnpm run clean                             # Remove build artifacts
```

That's it! You're ready to use the Caido Headers & Cookies Manager plugin.
