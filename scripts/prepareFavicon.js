const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function prepareFavicon() {
  const avatarPath = path.join(process.cwd(), 'public', 'images', 'avatar.jpg');
  const faviconSourcePath = path.join(process.cwd(), 'public', 'favicon.png');
  
  // If favicon source doesn't exist, create it from avatar
  if (!fs.existsSync(faviconSourcePath) && fs.existsSync(avatarPath)) {
    await sharp(avatarPath)
      .resize(512, 512)
      .toFormat('png')
      .toFile(faviconSourcePath);
  }
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!fs.existsSync(faviconSourcePath)) {
    console.error('No favicon source found! Please add favicon.png to public directory');
    process.exit(1);
  }

  // Generate different sizes
  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-48x48.png': 48,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
  };

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(faviconSourcePath)
      .resize(size, size)
      .toFile(path.join(outputDir, filename));
  }

  // Generate ICO file (supports multiple sizes)
  await sharp(faviconSourcePath)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon.ico'));
  
  // Generate site.webmanifest
  const manifest = {
    name: 'Romain BOBOE',
    short_name: 'RB',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };

  fs.writeFileSync(
    path.join(outputDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
}

prepareFavicon().catch(console.error);
