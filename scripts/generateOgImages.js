const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateOgImages() {
  const sourceImage = path.join(process.cwd(), 'public', 'images', 'avatar.jpg');
  const outputDir = path.join(process.cwd(), 'public', 'images', 'og');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create SVG overlay for different dimensions
  const createSvg = (width, height) => `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.4)"/>
      <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="${width * 0.05}" fill="white">
        Romain BOBOE
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="${width * 0.033}" fill="white">
        Full Stack Developer
      </text>
    </svg>
  `;

  // Create Open Graph image (1200x630)
  const ogSvg = createSvg(1200, 630);
  await sharp(sourceImage)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'center'
    })
    .composite([{
      input: Buffer.from(ogSvg),
      blend: 'over'
    }])
    .toFile(path.join(outputDir, 'og-image.jpg'));

  // Create standalone OG SVG
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{
      input: Buffer.from(ogSvg),
      blend: 'over'
    }])
    .png()
    .toFile(path.join(outputDir, 'og.png'));

  // Create Twitter card image (1200x600)
  const twitterSvg = createSvg(1200, 600);
  await sharp(sourceImage)
    .resize(1200, 600, {
      fit: 'cover',
      position: 'center'
    })
    .composite([{
      input: Buffer.from(twitterSvg),
      blend: 'over'
    }])
    .toFile(path.join(outputDir, 'twitter-card.jpg'));

  // Create standalone Twitter card SVG
  await sharp({
    create: {
      width: 800,
      height: 418,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{
      input: Buffer.from(createSvg(800, 418)),
      blend: 'over'
    }])
    .png()
    .toFile(path.join(outputDir, 'twitter-card.png'));
}

generateOgImages().catch(console.error);
