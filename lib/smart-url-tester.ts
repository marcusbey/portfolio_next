import puppeteer from 'puppeteer'

export interface URLCandidate {
  url: string
  source: 'vercel' | 'github' | 'domain_pattern' | 'manual'
  confidence: number
  accessibilityScore: number
  contentQuality: number
  isLoginPage: boolean
  isErrorPage: boolean
  hasMainContent: boolean
  loadTime: number
  statusCode: number
  finalUrl?: string
  pageTitle?: string
  metaDescription?: string
  screenshotable: boolean
}

export interface URLTestResult {
  originalUrl: string
  bestUrl: URLCandidate | null
  allCandidates: URLCandidate[]
  fallbackOptions: {
    githubReadmeImages: string[]
    projectLogos: string[]
    defaultPlaceholders: string[]
  }
}

export class SmartURLTester {
  private browser: any = null
  private readonly maxConcurrent = 3
  private readonly testTimeout = 30000

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
          '--disable-images', // Faster loading for testing
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
   * Generate smart URL candidates based on project info
   */
  generateURLCandidates(projectName: string, vercelUrl?: string, githubUrl?: string): string[] {
    const candidates: string[] = []
    
    // 1. Direct Vercel URL (highest priority)
    if (vercelUrl) {
      candidates.push(vercelUrl)
      
      // Try HTTPS if HTTP
      if (vercelUrl.startsWith('http://')) {
        candidates.push(vercelUrl.replace('http://', 'https://'))
      }
    }

    // 2. Common domain patterns from project name
    const cleanName = projectName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const domainPatterns = [
      `https://${cleanName}.vercel.app`,
      `https://${cleanName}.netlify.app`, 
      `https://${cleanName}.herokuapp.com`,
      `https://${cleanName}.com`,
      `https://www.${cleanName}.com`,
      `https://${cleanName}.dev`,
      `https://${cleanName}.app`,
      `https://${cleanName}.io`,
      `https://${cleanName}-app.vercel.app`,
      `https://${cleanName}-web.vercel.app`,
      `https://${cleanName}-frontend.vercel.app`,
    ]

    candidates.push(...domainPatterns)

    // 3. GitHub Pages patterns
    if (githubUrl) {
      const repoMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (repoMatch) {
        const [, owner, repo] = repoMatch
        candidates.push(
          `https://${owner}.github.io/${repo}`,
          `https://${owner}.github.io/${repo.replace('.git', '')}`,
        )
      }
    }

    // 4. Alternative common patterns
    const alternativePatterns = [
      `https://${cleanName.replace('-', '')}.vercel.app`,
      `https://${cleanName}app.vercel.app`,
      `https://my-${cleanName}.vercel.app`,
      `https://${cleanName}-demo.vercel.app`,
      `https://${cleanName}-project.vercel.app`,
    ]

    candidates.push(...alternativePatterns)

    // Remove duplicates and invalid URLs
    return [...new Set(candidates)].filter(url => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    })
  }

  /**
   * Test a single URL candidate with comprehensive analysis
   */
  async testURLCandidate(url: string, source: URLCandidate['source']): Promise<URLCandidate> {
    const startTime = Date.now()
    
    const candidate: URLCandidate = {
      url,
      source,
      confidence: 0,
      accessibilityScore: 0,
      contentQuality: 0,
      isLoginPage: false,
      isErrorPage: false,
      hasMainContent: false,
      loadTime: 0,
      statusCode: 0,
      screenshotable: false,
    }

    try {
      await this.init()
      
      const page = await this.browser.newPage()
      
      // Set realistic viewport and user agent
      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 })
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Block heavy resources for faster testing
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const resourceType = req.resourceType()
        if (['media', 'font'].includes(resourceType)) {
          req.abort()
        } else {
          req.continue()
        }
      })

      console.log(`🔍 Testing URL: ${url}`)

      // Navigate with timeout
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.testTimeout,
      })

      candidate.loadTime = Date.now() - startTime
      candidate.statusCode = response?.status() || 0
      candidate.finalUrl = page.url()
      
      // Get page metadata
      const [title, description] = await Promise.all([
        page.title().catch(() => ''),
        page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null)
      ])
      
      candidate.pageTitle = title
      candidate.metaDescription = description

      // Analyze page content
      const pageAnalysis = await page.evaluate(() => {
        const title = document.title.toLowerCase()
        const bodyText = document.body?.innerText?.toLowerCase() || ''
        const currentUrl = window.location.href.toLowerCase()

        // Login detection
        const loginIndicators = [
          'login', 'sign in', 'authentication', 'log in to vercel',
          'continue to vercel', 'enter your email', 'continue with',
          'authenticate', 'please sign in'
        ]
        
        const isLoginPage = loginIndicators.some(indicator => 
          title.includes(indicator) || 
          bodyText.includes(indicator) ||
          currentUrl.includes(indicator)
        ) || currentUrl.includes('vercel.com/login') || currentUrl.includes('/auth/')

        // Error detection
        const errorIndicators = ['404', 'not found', 'error', 'page not found', 'oops']
        const isErrorPage = errorIndicators.some(indicator => 
          title.includes(indicator) || bodyText.includes(indicator)
        )

        // Main content detection
        const mainContentSelectors = [
          'main', '#app', '#root', '.app', '.container', 
          'article', '.content', '#main', '.main-content',
          'section[role="main"]', '[data-testid="main"]'
        ]
        
        const hasMainContent = mainContentSelectors.some(selector => 
          document.querySelector(selector) !== null
        )

        // Content quality indicators
        const qualityIndicators = {
          hasImages: document.images.length > 0,
          hasNavigation: document.querySelectorAll('nav, .nav, .navbar, .navigation').length > 0,
          hasButtons: document.querySelectorAll('button, .btn, [role="button"]').length > 0,
          hasLinks: document.links.length > 3,
          textLength: bodyText.length,
          hasStructure: document.querySelectorAll('section, article, aside, header, footer').length > 2
        }

        return {
          isLoginPage,
          isErrorPage,
          hasMainContent,
          qualityIndicators,
          bodyLength: bodyText.length
        }
      })

      // Update candidate with analysis results
      candidate.isLoginPage = pageAnalysis.isLoginPage
      candidate.isErrorPage = pageAnalysis.isErrorPage
      candidate.hasMainContent = pageAnalysis.hasMainContent

      // Calculate scores
      candidate.accessibilityScore = this.calculateAccessibilityScore(candidate)
      candidate.contentQuality = this.calculateContentQuality(pageAnalysis.qualityIndicators, pageAnalysis.bodyLength)
      candidate.confidence = this.calculateConfidence(candidate)
      candidate.screenshotable = this.isScreenshotable(candidate)

      await page.close()
      
      console.log(`✅ URL tested: ${url} (Score: ${candidate.confidence.toFixed(2)})`)
      
    } catch (error) {
      console.error(`❌ Failed to test URL ${url}:`, error)
      candidate.loadTime = Date.now() - startTime
      candidate.isErrorPage = true
    }

    return candidate
  }

  /**
   * Calculate accessibility score based on response and loading
   */
  private calculateAccessibilityScore(candidate: URLCandidate): number {
    let score = 0
    
    // Status code scoring
    if (candidate.statusCode === 200) score += 40
    else if (candidate.statusCode >= 200 && candidate.statusCode < 300) score += 30
    else if (candidate.statusCode >= 300 && candidate.statusCode < 400) score += 20
    
    // Load time scoring (faster = better)
    if (candidate.loadTime < 3000) score += 30
    else if (candidate.loadTime < 8000) score += 20
    else if (candidate.loadTime < 15000) score += 10
    
    // Content availability
    if (!candidate.isLoginPage) score += 20
    if (!candidate.isErrorPage) score += 10
    
    return Math.min(score, 100)
  }

  /**
   * Calculate content quality score
   */
  private calculateContentQuality(indicators: any, bodyLength: number): number {
    let score = 0
    
    // Content richness
    if (indicators.hasImages) score += 15
    if (indicators.hasNavigation) score += 15
    if (indicators.hasButtons) score += 10
    if (indicators.hasLinks) score += 10
    if (indicators.hasStructure) score += 20
    
    // Text content scoring
    if (bodyLength > 500) score += 15
    else if (bodyLength > 200) score += 10
    else if (bodyLength > 50) score += 5
    
    // Bonus for well-structured content
    if (indicators.hasNavigation && indicators.hasStructure && indicators.hasImages) {
      score += 15
    }
    
    return Math.min(score, 100)
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(candidate: URLCandidate): number {
    // Base scoring
    let confidence = (candidate.accessibilityScore * 0.6) + (candidate.contentQuality * 0.4)
    
    // Source priority bonuses
    const sourceBonus = {
      vercel: 20,
      github: 10,
      domain_pattern: 5,
      manual: 0
    }
    
    confidence += sourceBonus[candidate.source] || 0
    
    // Penalties
    if (candidate.isLoginPage) confidence -= 80
    if (candidate.isErrorPage) confidence -= 70
    if (!candidate.hasMainContent) confidence -= 30
    
    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Determine if URL is good for screenshots
   */
  private isScreenshotable(candidate: URLCandidate): boolean {
    return candidate.accessibilityScore > 60 && 
           candidate.contentQuality > 40 && 
           !candidate.isLoginPage && 
           !candidate.isErrorPage &&
           candidate.statusCode === 200
  }

  /**
   * Test multiple URLs concurrently and find the best one
   */
  async findBestURL(projectName: string, vercelUrl?: string, githubUrl?: string): Promise<URLTestResult> {
    const candidates = this.generateURLCandidates(projectName, vercelUrl, githubUrl)
    console.log(`🔍 Generated ${candidates.length} URL candidates for ${projectName}`)
    
    const results: URLCandidate[] = []
    const fallbackOptions = {
      githubReadmeImages: [],
      projectLogos: [],
      defaultPlaceholders: []
    }

    // Test URLs in batches to avoid overwhelming servers
    for (let i = 0; i < candidates.length; i += this.maxConcurrent) {
      const batch = candidates.slice(i, i + this.maxConcurrent)
      
      const batchResults = await Promise.allSettled(
        batch.map((url, index) => {
          const source = index === 0 && vercelUrl === url ? 'vercel' : 'domain_pattern'
          return this.testURLCandidate(url, source as URLCandidate['source'])
        })
      )
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        }
      })

      // Small delay between batches
      if (i + this.maxConcurrent < candidates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Sort by confidence score
    results.sort((a, b) => b.confidence - a.confidence)
    
    // Find the best screenshotable URL
    const bestUrl = results.find(candidate => candidate.screenshotable) || 
                   results.find(candidate => candidate.confidence > 30) || 
                   results[0] || null

    console.log(`🏆 Best URL for ${projectName}: ${bestUrl?.url} (Score: ${bestUrl?.confidence.toFixed(2) || 'N/A'})`)

    return {
      originalUrl: vercelUrl || candidates[0] || '',
      bestUrl,
      allCandidates: results,
      fallbackOptions
    }
  }

  /**
   * Quick health check for a URL
   */
  async quickHealthCheck(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Health-Check/1.0)'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
let smartURLTester: SmartURLTester | null = null

export function getSmartURLTester(): SmartURLTester {
  if (!smartURLTester) {
    smartURLTester = new SmartURLTester()
  }
  return smartURLTester
}

export async function cleanupSmartURLTester() {
  if (smartURLTester) {
    await smartURLTester.close()
    smartURLTester = null
  }
}