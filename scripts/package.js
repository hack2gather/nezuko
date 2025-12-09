#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the root directory
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const packageDir = path.join(rootDir, 'package');
const outputZip = path.join(rootDir, 'caido-headers-sidebar.zip');

console.log('📦 Packaging Caido plugin...\n');

// Clean up old package directory and zip
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
}
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

// Create package directory
fs.mkdirSync(packageDir, { recursive: true });

// Copy required files to package directory
const filesToCopy = [
  { src: 'manifest.json', dest: 'manifest.json' },
  { src: 'dist/frontend.js', dest: 'frontend.js' },
  { src: 'dist/backend.js', dest: 'backend.js' },
  { src: 'dist/styles.css', dest: 'styles.css' }
];

console.log('Copying files to package directory...');
for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file.src);
  const destPath = path.join(packageDir, file.dest);

  if (!fs.existsSync(srcPath)) {
    console.error(`❌ Error: ${file.src} not found. Did you run 'pnpm run build' first?`);
    process.exit(1);
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`  ✓ ${file.src} → package/${file.dest}`);
}

console.log('\nCreating zip file...');

// Create zip file (cross-platform approach)
try {
  // Check if we're on Windows
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // Use PowerShell on Windows
    const psCommand = `Compress-Archive -Path "${packageDir}\\*" -DestinationPath "${outputZip}" -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  } else {
    // Use zip command on Unix-like systems
    execSync(`cd "${packageDir}" && zip -r "${outputZip}" .`, { stdio: 'inherit' });
  }

  console.log(`\n✅ Plugin packaged successfully!`);
  console.log(`📦 Output: ${path.basename(outputZip)}`);
  console.log(`📍 Location: ${outputZip}`);

  // Show zip contents
  console.log('\n📋 Package contents:');
  const files = fs.readdirSync(packageDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(packageDir, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  • ${file} (${sizeKB} KB)`);
  });

  // Clean up package directory
  fs.rmSync(packageDir, { recursive: true, force: true });

  console.log('\n🎉 Ready to install in Caido!');
  console.log('   Go to Caido → Settings → Plugins → Install from file');
  console.log(`   Select: ${path.basename(outputZip)}\n`);

} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  console.error('\nTrying alternative method...');

  // Fallback: Manual instructions
  console.log('\nPlease create the zip manually:');
  console.log('1. Navigate to the "package" directory');
  console.log('2. Select all files (manifest.json, frontend.js, backend.js, styles.css)');
  console.log('3. Right-click and choose "Compress" or "Send to → Compressed folder"');
  console.log('4. Name it: caido-headers-sidebar.zip');
  console.log('5. Make sure the files are at the ROOT of the zip, not in a subfolder!\n');

  process.exit(1);
}
