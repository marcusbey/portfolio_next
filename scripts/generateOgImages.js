const sharp = require('sharp');
const path = require('path');

async function generateOgImages() {
  const sourceImage = path.join(process.cwd(), 'public', 'images', 'avatar.jpg');
  const outputDir = path.join(process.cwd(), 'public', 'images', 'og');

  // Create Open Graph image (1200x630 is the recommended size)
  await sharp(sourceImage)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'center'
    })
    .composite([{
      input: Buffer.from(`
        <svg width="1200" height="630">
          <rect x="0" y="0" width="1200" height="630" fill="rgba(0,0,0,0.4)"/>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="60" fill="white">
            Romain BOBOE
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="40" fill="white">
            Full Stack Developer
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .toFile(path.join(outputDir, 'og-image.jpg'));

  // Create Twitter card image (1200x600)
  await sharp(sourceImage)
    .resize(1200, 600, {
      fit: 'cover',
      position: 'center'
    })
    .composite([{
      input: Buffer.from(`
        <svg width="1200" height="600">
          <rect x="0" y="0" width="1200" height="600" fill="rgba(0,0,0,0.4)"/>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="60" fill="white">
            Romain BOBOE
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="40" fill="white">
            Full Stack Developer
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .toFile(path.join(outputDir, 'twitter-card.jpg'));

  console.log('Generated Open Graph and Twitter card images');
}

generateOgImages().catch(console.error);
