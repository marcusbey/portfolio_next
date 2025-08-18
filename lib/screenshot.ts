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
      waitTime = 3000
    } = options

    try {
      await this.init()
      
      const page = await this.browser.newPage()
      
      // Set viewport
      await page.setViewport({ width, height })
      
      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
      
      // Navigate to the URL with timeout
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })
      
      // Wait for additional content to load
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 80,
        fullPage: false,
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