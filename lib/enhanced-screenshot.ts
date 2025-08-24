import puppeteer from 'puppeteer'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { URLCandidate } from './smart-url-tester'

export interface ScreenshotOptions {
  url: string
  projectName: string
  width?: number
  height?: number
  waitTime?: number
  captureFullPage?: boolean
  hideOverlays?: boolean
  optimizeForHero?: boolean
  retryCount?: number
  deviceType?: 'desktop' | 'tablet' | 'mobile'
}

export interface ScreenshotResult {
  success: boolean
  screenshotPath?: string
  error?: string
  metadata: {
    url: string
    finalUrl: string
    pageTitle: string
    loadTime: number
    contentDetected: boolean
    heroSectionFound: boolean
    screenshotSize: { width: number; height: number }
  }
}

export interface ViewportConfig {
  width: number
  height: number
  deviceScaleFactor: number
  userAgent: string
}

export class EnhancedScreenshotService {
  private browser: any = null
  private readonly screenshotsDir: string

  constructor() {
    this.screenshotsDir = path.join(process.cwd(), 'public', 'images', 'projects', 'generated')
    this.ensureDirectoryExists()
  }

  private ensureDirectoryExists() {
    if (!existsSync(this.screenshotsDir)) {
      mkdirSync(this.screenshotsDir, { recursive: true })
    }
  }

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
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
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

  /**
   * Get viewport configuration for different device types
   */
  private getViewportConfig(deviceType: 'desktop' | 'tablet' | 'mobile'): ViewportConfig {
    const configs = {
      desktop: {
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      tablet: {
        width: 768,
        height: 1024,
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      },
      mobile: {
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      }
    }
    return configs[deviceType]
  }

  /**
   * Enhanced screenshot generation with smart content detection
   */
  async generateScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    const {
      url,
      projectName,
      width = 1200,
      height = 630,
      waitTime = 8000,
      captureFullPage = false,
      hideOverlays = true,
      optimizeForHero = true,
      retryCount = 2,
      deviceType = 'desktop'
    } = options

    const startTime = Date.now()
    const result: ScreenshotResult = {
      success: false,
      metadata: {
        url,
        finalUrl: url,
        pageTitle: '',
        loadTime: 0,
        contentDetected: false,
        heroSectionFound: false,
        screenshotSize: { width, height }
      }
    }

    let attempts = 0
    let lastError: Error | null = null

    while (attempts <= retryCount) {
      try {
        await this.init()
        
        const page = await this.browser.newPage()
        const viewport = this.getViewportConfig(deviceType)
        
        // Set viewport and user agent
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: viewport.deviceScaleFactor
        })
        
        await page.setUserAgent(viewport.userAgent)

        // Intelligent request interception
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          const resourceType = req.resourceType()
          const url = req.url()
          
          // Block unnecessary resources but allow critical ones
          if (resourceType === 'media' && !url.includes('hero') && !url.includes('banner')) {
            req.abort()
          } else if (resourceType === 'font' && attempts === 0) {
            // Allow fonts on first attempt for better visual quality
            req.continue()
          } else if (['stylesheet', 'document', 'script', 'xhr', 'fetch'].includes(resourceType)) {
            req.continue()
          } else if (resourceType === 'image') {
            // Only load images that might be important
            if (url.includes('logo') || url.includes('hero') || url.includes('banner') || url.includes('og-image')) {
              req.continue()
            } else {
              req.abort()
            }
          } else {
            req.continue()
          }
        })

        console.log(`📸 Attempt ${attempts + 1}: Capturing screenshot for ${projectName} at ${url}`)

        // Navigate with proper error handling
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        })

        if (!response || !response.ok()) {
          throw new Error(`Page response not OK: ${response?.status()}`)
        }

        result.metadata.finalUrl = page.url()
        result.metadata.pageTitle = await page.title()

        // Wait for critical content to load
        await this.waitForContent(page, waitTime)

        // Analyze page content
        const contentAnalysis = await this.analyzePageContent(page)
        result.metadata.contentDetected = contentAnalysis.hasContent
        result.metadata.heroSectionFound = contentAnalysis.hasHeroSection

        // Hide overlays and distracting elements
        if (hideOverlays) {
          await this.hideOverlays(page)
        }

        // Optimize viewport for content
        let screenshotConfig
        if (optimizeForHero && contentAnalysis.hasHeroSection) {
          screenshotConfig = await this.optimizeForHeroSection(page, width, height)
        } else {
          screenshotConfig = { x: 0, y: 0, width, height }
        }

        // Add final delay for animations and lazy loading
        await page.waitForTimeout(2000)

        // Take the screenshot
        const screenshot = await page.screenshot({
          type: 'jpeg',
          quality: 90,
          fullPage: captureFullPage,
          clip: captureFullPage ? undefined : screenshotConfig,
        })

        await page.close()

        // Save screenshot
        const filename = this.generateFilename(projectName)
        const filePath = path.join(this.screenshotsDir, filename)
        writeFileSync(filePath, screenshot)

        result.success = true
        result.screenshotPath = `/images/projects/generated/${filename}`
        result.metadata.loadTime = Date.now() - startTime
        result.metadata.screenshotSize = screenshotConfig

        console.log(`✅ Screenshot generated successfully: ${result.screenshotPath}`)
        break

      } catch (error) {
        attempts++
        lastError = error as Error
        console.warn(`⚠️ Screenshot attempt ${attempts} failed for ${projectName}: ${lastError.message}`)
        
        if (attempts <= retryCount) {
          console.log(`🔄 Retrying screenshot capture (${attempts}/${retryCount})...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    if (!result.success && lastError) {
      result.error = lastError.message
      console.error(`❌ Failed to generate screenshot for ${projectName} after ${attempts} attempts`)
    }

    result.metadata.loadTime = Date.now() - startTime
    return result
  }

  /**
   * Smart content waiting with multiple strategies
   */
  private async waitForContent(page: any, baseWaitTime: number) {
    const strategies = [
      // Wait for main content selectors
      async () => {
        try {
          await page.waitForSelector('main, #app, #root, .app, [role="main"], .container', {
            timeout: 8000
          })
          return true
        } catch {
          return false
        }
      },

      // Wait for navigation elements
      async () => {
        try {
          await page.waitForSelector('nav, .nav, .navbar, .navigation, header', {
            timeout: 5000
          })
          return true
        } catch {
          return false
        }
      },

      // Wait for images to load
      async () => {
        try {
          await page.waitForFunction(() => {
            const images = Array.from(document.images)
            return images.length === 0 || images.every(img => img.complete)
          }, { timeout: 10000 })
          return true
        } catch {
          return false
        }
      },

      // Wait for animations and transitions
      async () => {
        try {
          await page.waitForFunction(() => {
            return !document.querySelector('.loading, .spinner, [class*="loading"]')
          }, { timeout: 8000 })
          return true
        } catch {
          return false
        }
      }
    ]

    // Try strategies in parallel with timeouts
    await Promise.allSettled(strategies.map(strategy => strategy()))
    
    // Base wait time for any remaining loading
    await page.waitForTimeout(Math.min(baseWaitTime, 8000))
  }

  /**
   * Analyze page content to determine screenshot strategy
   */
  private async analyzePageContent(page: any) {
    return await page.evaluate(() => {
      const hasContent = document.body && document.body.children.length > 0
      
      // Look for hero sections
      const heroSelectors = [
        '.hero', '.banner', '.jumbotron', '.intro', '.landing',
        '[class*="hero"]', '[class*="banner"]', '[id*="hero"]',
        'section:first-of-type', '.container > section:first-child',
        'main > section:first-child', '.main-content > section:first-child'
      ]
      
      const heroElement = heroSelectors
        .map(selector => document.querySelector(selector))
        .find(el => el !== null)
      
      const hasHeroSection = !!heroElement
      
      // Analyze content structure
      const contentAnalysis = {
        hasNavigation: !!document.querySelector('nav, .nav, .navbar, .navigation'),
        hasButtons: document.querySelectorAll('button, .btn, [role="button"]').length > 0,
        hasImages: document.images.length > 0,
        textLength: document.body?.innerText?.length || 0,
        hasCards: document.querySelectorAll('.card, [class*="card"]').length > 0,
        hasGrid: document.querySelectorAll('.grid, [class*="grid"], .row').length > 0
      }

      return {
        hasContent,
        hasHeroSection,
        heroElement: heroElement ? {
          tagName: heroElement.tagName,
          className: heroElement.className,
          id: heroElement.id,
          rect: heroElement.getBoundingClientRect()
        } : null,
        contentAnalysis
      }
    })
  }

  /**
   * Hide overlays and distracting elements
   */
  private async hideOverlays(page: any) {
    await page.evaluate(() => {
      const overlaySelectors = [
        // Cookie banners
        '[class*="cookie"]', '[id*="cookie"]', '.cookie-consent', '.gdpr-banner',
        '.cookie-notice', '.cookie-bar', '.cookies-banner',
        
        // Modals and popups
        '.modal', '.popup', '.overlay', '[class*="modal"]', '[class*="popup"]',
        '[class*="overlay"]', '.dialog', '[role="dialog"]',
        
        // Chat widgets
        '[class*="chat"]', '[id*="chat"]', '.intercom', '.zendesk',
        '.helpscout', '.drift', '.livechat',
        
        // Newsletter popups
        '[class*="newsletter"]', '[class*="subscribe"]', '.mailchimp',
        
        // Notification bars
        '.notification', '.alert', '.banner', '[class*="notification"]',
        '.announcement', '.promo-bar',
        
        // Loading overlays
        '.loading-overlay', '.spinner-overlay', '[class*="loading-overlay"]',
        
        // Video overlays
        '.video-overlay', '.play-button-overlay'
      ]

      overlaySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect()
            // Only hide if it's visible and positioned over content
            if (rect.width > 0 && rect.height > 0 && 
                (el.style.position === 'fixed' || el.style.position === 'absolute' ||
                 getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'absolute')) {
              el.style.display = 'none'
            }
          }
        })
      })

      // Hide elements with high z-index that might be overlays
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const zIndex = parseInt(getComputedStyle(el).zIndex)
          if (zIndex > 1000) {
            const rect = el.getBoundingClientRect()
            if (rect.width > window.innerWidth * 0.8 || rect.height > window.innerHeight * 0.8) {
              el.style.display = 'none'
            }
          }
        }
      })
    })
  }

  /**
   * Optimize screenshot area for hero content
   */
  private async optimizeForHeroSection(page: any, targetWidth: number, targetHeight: number) {
    const heroInfo = await page.evaluate(() => {
      const heroSelectors = [
        '.hero', '.banner', '.jumbotron', '.intro', '.landing',
        '[class*="hero"]', '[class*="banner"]', '[id*="hero"]',
        'section:first-of-type', 'main > section:first-child'
      ]
      
      for (const selector of heroSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.width > 300 && rect.height > 200) {
            return {
              x: Math.max(0, rect.left),
              y: Math.max(0, rect.top),
              width: Math.min(rect.width, window.innerWidth),
              height: Math.min(rect.height, window.innerHeight)
            }
          }
        }
      }

      // Fallback: top portion of the page
      return {
        x: 0,
        y: 0,
        width: Math.min(targetWidth, window.innerWidth),
        height: Math.min(targetHeight, window.innerHeight)
      }
    })

    // Ensure reasonable dimensions
    return {
      x: heroInfo.x,
      y: heroInfo.y,
      width: Math.max(800, Math.min(heroInfo.width, targetWidth)),
      height: Math.max(500, Math.min(heroInfo.height, targetHeight))
    }
  }

  /**
   * Generate unique filename for screenshot
   */
  private generateFilename(projectName: string): string {
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    return `${sanitizedName}-${Date.now()}.jpg`
  }

  /**
   * Generate multiple screenshots for different devices
   */
  async generateResponsiveScreenshots(options: ScreenshotOptions): Promise<{
    desktop?: ScreenshotResult
    tablet?: ScreenshotResult
    mobile?: ScreenshotResult
  }> {
    const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile']
    const results: any = {}

    for (const device of devices) {
      try {
        console.log(`📱 Generating ${device} screenshot for ${options.projectName}`)
        results[device] = await this.generateScreenshot({
          ...options,
          deviceType: device,
          waitTime: 6000 // Slightly faster for multiple captures
        })
      } catch (error) {
        console.error(`Failed to generate ${device} screenshot:`, error)
      }
    }

    return results
  }

  /**
   * Batch screenshot generation with intelligent queuing
   */
  async generateBulkScreenshots(
    projects: Array<{ url: string; name: string; id: string; urlCandidate?: URLCandidate }>
  ): Promise<Map<string, ScreenshotResult>> {
    const results = new Map<string, ScreenshotResult>()
    
    try {
      await this.init()
      
      for (const project of projects) {
        console.log(`📸 Generating enhanced screenshot for ${project.name}...`)
        
        // Use the best URL if available
        const targetUrl = project.urlCandidate?.url || project.url
        
        const result = await this.generateScreenshot({
          url: targetUrl,
          projectName: project.name,
          optimizeForHero: true,
          hideOverlays: true,
          retryCount: 1 // Reduced retries for bulk operations
        })
        
        results.set(project.id, result)
        
        // Respectful delay between screenshots
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
      
    } catch (error) {
      console.error('Bulk enhanced screenshot generation failed:', error)
    }
    
    return results
  }
}

// Singleton instance
let enhancedScreenshotService: EnhancedScreenshotService | null = null

export function getEnhancedScreenshotService(): EnhancedScreenshotService {
  if (!enhancedScreenshotService) {
    enhancedScreenshotService = new EnhancedScreenshotService()
  }
  return enhancedScreenshotService
}

export async function cleanupEnhancedScreenshotService() {
  if (enhancedScreenshotService) {
    await enhancedScreenshotService.close()
    enhancedScreenshotService = null
  }
}