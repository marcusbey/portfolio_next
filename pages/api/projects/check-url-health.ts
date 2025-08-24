import type { NextApiRequest, NextApiResponse } from 'next'
import { getSmartScreenshotOrchestrator } from '@/lib/smart-screenshot-orchestrator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // Simple auth check
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    const { url, urls } = req.body
    
    if (!url && (!urls || !Array.isArray(urls))) {
      return res.status(400).json({ 
        error: 'Either "url" or "urls" array is required' 
      })
    }

    const orchestrator = getSmartScreenshotOrchestrator()
    
    if (url) {
      // Check single URL
      console.log(`🔍 Checking URL health: ${url}`)
      
      const healthCheck = await orchestrator.quickHealthCheck(url)
      
      return res.status(200).json({
        success: true,
        url,
        health: healthCheck
      })
      
    } else {
      // Check multiple URLs
      console.log(`🔍 Checking health for ${urls.length} URLs`)
      
      const results = await Promise.allSettled(
        urls.map(async (urlToCheck: string) => {
          const health = await orchestrator.quickHealthCheck(urlToCheck)
          return {
            url: urlToCheck,
            health
          }
        })
      )
      
      const healthResults = results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            url: 'unknown',
            health: {
              accessible: false,
              screenshotable: false,
              confidence: 0,
              issues: [`Health check failed: ${result.reason}`]
            }
          }
        }
      })
      
      const summary = {
        total: urls.length,
        accessible: healthResults.filter(r => r.health.accessible).length,
        screenshotable: healthResults.filter(r => r.health.screenshotable).length,
        averageConfidence: healthResults.reduce((acc, r) => acc + r.health.confidence, 0) / urls.length
      }
      
      return res.status(200).json({
        success: true,
        summary,
        results: healthResults
      })
    }
    
  } catch (error) {
    console.error('URL health check error:', error)
    return res.status(500).json({
      error: 'Failed to check URL health',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}