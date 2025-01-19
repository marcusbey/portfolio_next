const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

async function generateFavicons() {
  const sourceIcon = path.join(process.cwd(), 'public', 'favicon.png');
  
  if (!fs.existsSync(sourceIcon)) {
    console.error('Source favicon.png not found in public directory');
    process.exit(1);
  }

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(sourceIcon)
      .resize(size, size)
      .toFile(path.join(process.cwd(), 'public', filename));
    
    console.log(`Generated ${filename}`);
  }

  // Generate ICO file
  await sharp(sourceIcon)
    .resize(32, 32)
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  
  console.log('Generated favicon.ico');
}
