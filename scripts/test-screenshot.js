const puppeteer = require('puppeteer')

async function testScreenshot() {
  let browser
  try {
    console.log('🚀 Starting Puppeteer test...')
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    })
    
    console.log('✅ Browser launched')
    
    const page = await browser.newPage()
    console.log('✅ New page created')
    
    await page.setViewport({ width: 1200, height: 630 })
    
    // Test with a simple URL first
    const testUrl = 'https://www.google.com'
    console.log(`🔍 Testing with: ${testUrl}`)
    
    await page.goto(testUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })
    
    console.log('✅ Page loaded')
    
    const title = await page.title()
    console.log(`📄 Page title: ${title}`)
    
    // Try to take a screenshot
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 })
    console.log(`✅ Screenshot taken, size: ${screenshot.length} bytes`)
    
    // Now test with Vercel bypass
    if (process.env.VERCEL_BYPASS_SECRET) {
      console.log('\n🔑 Testing with Vercel bypass...')
      const vercelUrl = `https://northscale.vercel.app?_vercel_share=${process.env.VERCEL_BYPASS_SECRET}`
      console.log(`🔍 Testing: ${vercelUrl}`)
      
      await page.goto(vercelUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      })
      
      const vercelTitle = await page.title()
      console.log(`📄 Vercel page title: ${vercelTitle}`)
      
      if (vercelTitle.toLowerCase().includes('login') || vercelTitle.toLowerCase().includes('vercel')) {
        console.log('⚠️ Still seeing login page!')
      } else {
        console.log('✅ Bypass worked! Not a login page')
      }
    } else {
      console.log('⚠️ VERCEL_BYPASS_SECRET not set in environment')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    if (browser) {
      await browser.close()
      console.log('🔒 Browser closed')
    }
  }
}

testScreenshot()