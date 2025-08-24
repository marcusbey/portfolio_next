require('dotenv').config()

async function testBypassUrl() {
  const bypass = process.env.VERCEL_BYPASS_SECRET
  
  console.log('🔑 VERCEL_BYPASS_SECRET:', bypass || 'NOT SET!')
  
  if (!bypass) {
    console.log('❌ Please add VERCEL_BYPASS_SECRET to your .env file')
    return
  }
  
  // Test URLs
  const testUrls = [
    `https://base32-tech.vercel.app?_vercel_share=${bypass}`,
    `https://northscale.vercel.app?_vercel_share=${bypass}`,
    `https://moood-ai.vercel.app?_vercel_share=${bypass}`
  ]
  
  console.log('\n🔍 Testing Vercel URLs with bypass...\n')
  
  for (const url of testUrls) {
    console.log(`Testing: ${url}`)
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScreenshotBot/1.0)'
        }
      })
      
      console.log(`  Status: ${response.status}`)
      console.log(`  Final URL: ${response.url}`)
      
      if (response.url.includes('login') || response.url.includes('auth')) {
        console.log('  ⚠️ Redirected to login!')
      } else if (response.status === 200) {
        console.log('  ✅ Success! URL is accessible')
      } else {
        console.log('  ❌ Failed with status:', response.status)
      }
    } catch (error) {
      console.log('  ❌ Error:', error.message)
    }
    console.log('')
  }
}

testBypassUrl()