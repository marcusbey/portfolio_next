import puppeteer from 'puppeteer'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

interface ScreenshotOptions {
  url: string
  projectName: string
  width?: number
  height?: number
  waitTime?: number
}

export class ScreenshotGenerator {
  private browser: any = null

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
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
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async generateScreenshot(options: ScreenshotOptions): Promise<string | null> {
    const {
      url,
      projectName,
      width = 1200,
      height = 630,
      waitTime = 5000
    } = options

    try {
      await this.init()
      
      const page = await this.browser.newPage()
      
      // Set viewport
      await page.setViewport({ width, height, deviceScaleFactor: 1 })
      
      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const resourceType = req.resourceType()
        if (resourceType === 'stylesheet' || resourceType === 'font') {
          req.continue()
        } else if (resourceType === 'image' && req.url().includes('favicon')) {
          req.abort()
        } else {
          req.continue()
        }
      })

      // Add Vercel bypass if it's a Vercel URL and we have the secret
      let finalUrl = url
      if (process.env.VERCEL_BYPASS_SECRET && (url.includes('.vercel.app') || url.includes('vercel.com'))) {
        const separator = url.includes('?') ? '&' : '?'
        finalUrl = `${url}${separator}_vercel_share=${process.env.VERCEL_BYPASS_SECRET}`
        console.log(`🔑 Using Vercel bypass for: ${projectName}`)
      }

      console.log(`🔍 Attempting to capture screenshot for ${projectName}: ${finalUrl}`)
      
      // Navigate to the URL with timeout and error handling
      const response = await page.goto(finalUrl, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      })

      if (!response || !response.ok()) {
        console.warn(`⚠️ Page response not OK for ${url}: ${response?.status()}`)
      }

      // Check if we're on a login or error page
      const pageTitle = await page.title()
      const pageContent = await page.content()
      const currentUrl = page.url()
      
      const isLoginPage = pageTitle.toLowerCase().includes('login') || 
                          pageTitle.toLowerCase().includes('sign in') ||
                          (pageTitle === 'Vercel' && pageContent.includes('Continue with')) || // Only exact "Vercel" title with login content
                          pageContent.includes('Log in to Vercel') ||
                          pageContent.includes('authentication required') ||
                          pageContent.includes('Login to continue') ||
                          pageContent.includes('continue to vercel') ||
                          currentUrl.includes('vercel.com/login') ||
                          currentUrl.includes('/auth/') || // More specific auth path
                          // Check for the specific Vercel login screen
                          pageContent.includes('data-testid="login"') ||
                          (pageContent.includes('Enter your email address') && pageContent.includes('Continue with'))

      const isErrorPage = pageTitle.toLowerCase().includes('error') ||
                          pageTitle.toLowerCase().includes('not found') ||
                          pageContent.includes('404') ||
                          pageContent.includes('Page not found') ||
                          pageContent.includes('This page could not be found')

      if (isLoginPage) {
        console.warn(`⚠️ Detected login page for ${projectName}`)
        console.warn(`   URL: ${url}`)
        console.warn(`   Final URL: ${currentUrl}`)
        console.warn(`   Page title: ${pageTitle}`)
        await page.close()
        return null
      }

      if (isErrorPage) {
        console.warn(`⚠️ Detected error page for ${projectName}, skipping screenshot`)
        await page.close()
        return null
      }

      // Wait for content to load and any animations to complete
      await page.waitForTimeout(waitTime)

      // Try to wait for main content (common selectors)
      try {
        await page.waitForSelector('main, #app, #root, .app, .container, body > div', {
          timeout: 10000
        })
      } catch (error) {
        console.log(`📸 No main content selector found for ${projectName}, proceeding with screenshot`)
      }

      // Hide cookie banners and other overlays
      await page.evaluate(() => {
        const elementsToHide = [
          '[class*="cookie"]',
          '[class*="banner"]',
          '[class*="popup"]',
          '[class*="modal"]',
          '[id*="cookie"]',
          '[id*="banner"]',
          '.cookie-consent',
          '.gdpr-banner'
        ]
        
        elementsToHide.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none'
            }
          })
        })
      })
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: false,
        clip: { x: 0, y: 0, width, height }
      })
      
      await page.close()
      
      // Ensure screenshots directory exists
      const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'projects', 'generated')
      if (!existsSync(screenshotsDir)) {
        mkdirSync(screenshotsDir, { recursive: true })
      }
      
      // Generate filename
      const sanitizedName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      const filename = `${sanitizedName}-${Date.now()}.jpg`
      const filePath = path.join(screenshotsDir, filename)
      
      // Save screenshot
      writeFileSync(filePath, screenshot)
      
      // Return public URL path
      return `/images/projects/generated/${filename}`
      
    } catch (error) {
      console.error(`Failed to generate screenshot for ${projectName}:`, error)
      return null
    }
  }

  async generateBulkScreenshots(projects: Array<{ url: string; name: string; id: string }>): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>()
    
    try {
      await this.init()
      
      for (const project of projects) {
        if (!project.url) {
          console.log(`Skipping ${project.name} - no URL`)
          results.set(project.id, null)
          continue
        }
        
        console.log(`📸 Generating screenshot for ${project.name}...`)
        
        const screenshotPath = await this.generateScreenshot({
          url: project.url,
          projectName: project.name,
        })
        
        results.set(project.id, screenshotPath)
        
        // Add delay between screenshots to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
    } catch (error) {
      console.error('Bulk screenshot generation failed:', error)
    }
    
    return results
  }
}

// Singleton instance
let screenshotGenerator: ScreenshotGenerator | null = null

export function getScreenshotGenerator(): ScreenshotGenerator {
  if (!screenshotGenerator) {
    screenshotGenerator = new ScreenshotGenerator()
  }
  return screenshotGenerator
}

export async function generateProjectScreenshot(url: string, projectName: string): Promise<string | null> {
  const generator = getScreenshotGenerator()
  return generator.generateScreenshot({ url, projectName })
}

export async function cleanupScreenshotGenerator() {
  if (screenshotGenerator) {
    await screenshotGenerator.close()
    screenshotGenerator = null
  }
}