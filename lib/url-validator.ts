interface URLTestResult {
  url: string
  isAccessible: boolean
  isLoginPage: boolean
  isErrorPage: boolean
  statusCode?: number
  finalUrl?: string
}

export class URLValidator {
  
  async testURL(url: string): Promise<URLTestResult> {
    try {
      console.log(`🔍 Testing URL accessibility: ${url}`)
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        redirect: 'follow'
      })

      const finalUrl = response.url
      const statusCode = response.status

      // Quick content check for login/error detection
      let isLoginPage = false
      let isErrorPage = false

      if (response.ok) {
        try {
          // Get a small sample of the page content
          const contentResponse = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
          })
          
          const content = await contentResponse.text()
          const title = content.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''
          
          isLoginPage = this.detectLoginPage(content, title, finalUrl)
          isErrorPage = this.detectErrorPage(content, title, statusCode)
          
        } catch (contentError) {
          console.warn(`⚠️ Could not get content for ${url}`)
        }
      } else {
        isErrorPage = true
      }

      return {
        url,
        isAccessible: response.ok && !isLoginPage && !isErrorPage,
        isLoginPage,
        isErrorPage,
        statusCode,
        finalUrl
      }

    } catch (error) {
      console.error(`❌ Error testing URL ${url}:`, error)
      return {
        url,
        isAccessible: false,
        isLoginPage: false,
        isErrorPage: true,
        statusCode: 0
      }
    }
  }

  private detectLoginPage(content: string, title: string, url: string): boolean {
    const loginIndicators = [
      'login',
      'sign in',
      'authentication',
      'log in to vercel',
      'continue to vercel',
      'enter your email',
      'data-testid="login"',
      'login-form',
      'auth-form'
    ]

    const contentLower = content.toLowerCase()
    const titleLower = title.toLowerCase()
    const urlLower = url.toLowerCase()

    return loginIndicators.some(indicator => 
      contentLower.includes(indicator) || 
      titleLower.includes(indicator) ||
      urlLower.includes(indicator)
    ) || urlLower.includes('vercel.com/login') || urlLower.includes('/auth/')
  }

  private detectErrorPage(content: string, title: string, statusCode: number): boolean {
    if (statusCode >= 400) return true

    const errorIndicators = [
      '404',
      'not found',
      'page not found',
      'error',
      'this page could not be found',
      'page does not exist'
    ]

    const contentLower = content.toLowerCase()
    const titleLower = title.toLowerCase()

    return errorIndicators.some(indicator => 
      contentLower.includes(indicator) || 
      titleLower.includes(indicator)
    )
  }

  async findBestURL(urls: string[]): Promise<string | null> {
    console.log(`🔍 Testing ${urls.length} URLs to find the best one`)
    
    const results = await Promise.all(
      urls.map(url => this.testURL(url))
    )

    // Find the first accessible URL
    const accessibleURL = results.find(result => result.isAccessible)
    
    if (accessibleURL) {
      console.log(`✅ Found accessible URL: ${accessibleURL.url}`)
      return accessibleURL.url
    }

    // Log results for debugging
    results.forEach(result => {
      console.log(`📊 ${result.url}: accessible=${result.isAccessible}, login=${result.isLoginPage}, error=${result.isErrorPage}, status=${result.statusCode}`)
    })

    console.warn(`⚠️ No accessible URLs found from: ${urls.join(', ')}`)
    return null
  }
}

export const urlValidator = new URLValidator()