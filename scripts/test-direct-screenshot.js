require('dotenv').config()
const { ScreenshotGenerator } = require('../lib/screenshot')

async function testDirectScreenshot() {
  const generator = new ScreenshotGenerator()
  
  try {
    console.log('🔑 VERCEL_BYPASS_SECRET:', process.env.VERCEL_BYPASS_SECRET ? 'Set' : 'Not set')
    
    // Test 1: A known working URL
    console.log('\n📸 Test 1: Testing with a known working URL...')
    const result1 = await generator.generateScreenshot({
      url: 'https://www.northscalegroup.com',
      projectName: 'test-northscale',
      waitTime: 5000
    })
    console.log('Result:', result1 ? `✅ Success - ${result1}` : '❌ Failed')
    
    // Test 2: A Vercel URL with bypass
    if (process.env.VERCEL_BYPASS_SECRET) {
      console.log('\n📸 Test 2: Testing Vercel URL with bypass...')
      const vercelUrl = `https://base32-tech.vercel.app?_vercel_share=${process.env.VERCEL_BYPASS_SECRET}`
      console.log('Testing URL:', vercelUrl)
      
      const result2 = await generator.generateScreenshot({
        url: vercelUrl,
        projectName: 'test-base32-vercel',
        waitTime: 5000
      })
      console.log('Result:', result2 ? `✅ Success - ${result2}` : '❌ Failed')
    }
    
    // Test 3: Direct Vercel URL without manually adding bypass
    console.log('\n📸 Test 3: Testing Vercel URL (bypass should be auto-added)...')
    const result3 = await generator.generateScreenshot({
      url: 'https://base32-tech.vercel.app',
      projectName: 'test-base32-auto',
      waitTime: 5000
    })
    console.log('Result:', result3 ? `✅ Success - ${result3}` : '❌ Failed')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await generator.close()
  }
}

testDirectScreenshot()