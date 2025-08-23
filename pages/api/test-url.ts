import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    console.log(`🔍 Testing URL: ${url}`)
    
    // Test the URL
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)'
      },
      redirect: 'follow'
    })
    
    const finalUrl = response.url
    const isRedirected = finalUrl !== url
    const isLogin = finalUrl.includes('/login') || 
                   finalUrl.includes('/auth') || 
                   finalUrl.includes('vercel.com/login') ||
                   finalUrl.includes('continue-to-vercel')
    
    // Get a bit of content to check for login indicators
    let contentCheck = null
    if (response.ok) {
      try {
        const contentResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)'
          }
        })
        const content = await contentResponse.text()
        contentCheck = {
          hasLoginText: content.includes('Log in') || content.includes('Continue with'),
          hasVercelText: content.includes('vercel.com'),
          title: content.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || 'No title found'
        }
      } catch (e) {
        contentCheck = { error: 'Could not fetch content' }
      }
    }
    
    const result = {
      url,
      status: response.status,
      ok: response.ok,
      finalUrl,
      isRedirected,
      isLogin,
      accessible: response.ok && !isLogin,
      contentCheck,
      headers: {
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server'),
      }
    }
    
    console.log(`📊 Result:`, result)
    
    res.status(200).json(result)
    
  } catch (error) {
    console.error('URL test error:', error)
    res.status(500).json({
      error: 'Failed to test URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}