import crypto from 'crypto'

// Generate a 32-character secret for Vercel bypass
export const VERCEL_BYPASS_SECRET = crypto.randomBytes(16).toString('hex')

// Vercel bypass parameters that you'll add to your Vercel project
export const getVercelBypassParams = () => {
  return {
    // This is the query parameter Vercel uses for bypassing protection
    bypassParam: '_vercel_share',
    // This is the secret value (32 characters)
    bypassSecret: VERCEL_BYPASS_SECRET,
    // Complete bypass URL format
    bypassUrl: (baseUrl: string) => `${baseUrl}?_vercel_share=${VERCEL_BYPASS_SECRET}`
  }
}

// Function to add bypass parameters to URLs for screenshot generation
export const addVercelBypass = (url: string): string => {
  if (!url) return url
  
  // Only add bypass for Vercel URLs
  if (url.includes('.vercel.app') || url.includes('vercel.com')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_vercel_share=${VERCEL_BYPASS_SECRET}`
  }
  
  return url
}

// Display the secret for you to add to Vercel
export const displayBypassInstructions = () => {
  console.log('🔑 Vercel Bypass Secret Generated:')
  console.log('================================')
  console.log(`Secret: ${VERCEL_BYPASS_SECRET}`)
  console.log('Length:', VERCEL_BYPASS_SECRET.length, 'characters')
  console.log('')
  console.log('📋 Instructions:')
  console.log('1. Go to each Vercel project → Settings → General → Deployment Protection')
  console.log('2. Keep "Vercel Authentication" enabled')
  console.log('3. Add this secret as a "Bypass for Automation"')
  console.log('4. Or add it as an environment variable: VERCEL_BYPASS_SECRET')
  console.log('')
  console.log('🔗 URLs will be accessed as:')
  console.log(`https://your-project.vercel.app?_vercel_share=${VERCEL_BYPASS_SECRET}`)
  
  return VERCEL_BYPASS_SECRET
}