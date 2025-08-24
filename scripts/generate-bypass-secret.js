const crypto = require('crypto')

// Generate a secure 32-character bypass secret
const generateBypassSecret = () => {
  const secret = crypto.randomBytes(16).toString('hex')
  
  console.log('🔑 VERCEL BYPASS SECRET GENERATED')
  console.log('='.repeat(50))
  console.log('')
  console.log(`SECRET: ${secret}`)
  console.log(`LENGTH: ${secret.length} characters`)
  console.log('')
  console.log('📋 SETUP INSTRUCTIONS:')
  console.log('1. Copy the secret above')
  console.log('2. Go to Vercel Dashboard → Your Project → Settings → General')
  console.log('3. Find "Deployment Protection" section')
  console.log('4. Click "Add Bypass for Automation"')
  console.log('5. Paste the secret as the bypass value')
  console.log('6. Repeat for all your projects')
  console.log('')
  console.log('🔗 HOW IT WORKS:')
  console.log(`Screenshots will access: https://your-project.vercel.app?_vercel_share=${secret}`)
  console.log('')
  console.log('💾 SAVE THIS SECRET - Add it to your .env file:')
  console.log(`VERCEL_BYPASS_SECRET="${secret}"`)
  console.log('')
  console.log('✅ After setup, run: npm run regenerate-screenshots')
  
  return secret
}

// Run the generator
const secret = generateBypassSecret()

module.exports = { secret }