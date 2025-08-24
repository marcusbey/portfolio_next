import { getSmartURLTester, URLTestResult, URLCandidate } from './smart-url-tester'
import { getEnhancedScreenshotService, ScreenshotResult } from './enhanced-screenshot'
import { getFallbackStrategiesService, FallbackResult } from './fallback-strategies'

export interface ProjectInput {
  id: string
  name: string
  vercelUrl?: string
  githubUrl?: string
  framework?: string
  technologies?: string[]
  description?: string
  manualUrls?: string[]
}

export interface SmartScreenshotResult {
  projectId: string
  success: boolean
  finalImagePath?: string
  strategy: 'smart_screenshot' | 'fallback_readme' | 'fallback_placeholder' | 'fallback_cached'
  urlTestResult?: URLTestResult
  screenshotResult?: ScreenshotResult
  fallbackResult?: FallbackResult
  error?: string
  metadata: {
    totalAttempts: number
    processingTime: number
    bestUrl?: string
    confidence?: number
  }
}

export class SmartScreenshotOrchestrator {
  private urlTester = getSmartURLTester()
  private screenshotService = getEnhancedScreenshotService()
  private fallbackService = getFallbackStrategiesService()
  
  /**
   * Generate the best possible screenshot for a project
   */
  async generateSmartScreenshot(project: ProjectInput): Promise<SmartScreenshotResult> {
    const startTime = Date.now()
    const result: SmartScreenshotResult = {
      projectId: project.id,
      success: false,
      strategy: 'smart_screenshot',
      metadata: {
        totalAttempts: 0,
        processingTime: 0
      }
    }

    try {
      console.log(`🚀 Starting smart screenshot generation for ${project.name}`)

      // Step 1: Find the best URL
      console.log(`🔍 Testing URLs for ${project.name}`)
      const urlTestResult = await this.urlTester.findBestURL(
        project.name,
        project.vercelUrl,
        project.githubUrl
      )
      
      result.urlTestResult = urlTestResult
      result.metadata.totalAttempts++

      // Check if we have manual override URLs to test
      if (project.manualUrls && project.manualUrls.length > 0) {
        console.log(`🔧 Testing manual override URLs for ${project.name}`)
        for (const manualUrl of project.manualUrls) {
          const manualCandidate = await this.urlTester.testURLCandidate(manualUrl, 'manual')
          urlTestResult.allCandidates.push(manualCandidate)
          
          if (manualCandidate.screenshotable && manualCandidate.confidence > (urlTestResult.bestUrl?.confidence || 0)) {
            urlTestResult.bestUrl = manualCandidate
          }
        }
        
        // Re-sort candidates
        urlTestResult.allCandidates.sort((a, b) => b.confidence - a.confidence)
      }

      // Step 2: Try smart screenshot if we have a good URL
      if (urlTestResult.bestUrl && urlTestResult.bestUrl.screenshotable) {
        console.log(`📸 Attempting smart screenshot for ${project.name}`)
        
        const screenshotResult = await this.screenshotService.generateScreenshot({
          url: urlTestResult.bestUrl.url,
          projectName: project.name,
          optimizeForHero: true,
          hideOverlays: true,
          retryCount: 2
        })
        
        result.screenshotResult = screenshotResult
        result.metadata.bestUrl = urlTestResult.bestUrl.url
        result.metadata.confidence = urlTestResult.bestUrl.confidence
        result.metadata.totalAttempts++

        if (screenshotResult.success && screenshotResult.screenshotPath) {
          result.success = true
          result.finalImagePath = screenshotResult.screenshotPath
          result.strategy = 'smart_screenshot'
          
          console.log(`✅ Smart screenshot successful for ${project.name}`)
          result.metadata.processingTime = Date.now() - startTime
          return result
        }
      }

      // Step 3: Try alternative URLs with lower confidence
      const alternativeUrls = urlTestResult.allCandidates
        .filter(candidate => candidate.confidence > 20 && !candidate.isLoginPage && !candidate.isErrorPage)
        .slice(0, 3) // Try top 3 alternatives

      for (const candidate of alternativeUrls) {
        console.log(`🔄 Trying alternative URL for ${project.name}: ${candidate.url}`)
        
        const screenshotResult = await this.screenshotService.generateScreenshot({
          url: candidate.url,
          projectName: project.name,
          optimizeForHero: true,
          hideOverlays: true,
          retryCount: 1 // Reduced retries for alternatives
        })
        
        result.metadata.totalAttempts++

        if (screenshotResult.success && screenshotResult.screenshotPath) {
          result.success = true
          result.finalImagePath = screenshotResult.screenshotPath
          result.strategy = 'smart_screenshot'
          result.screenshotResult = screenshotResult
          result.metadata.bestUrl = candidate.url
          result.metadata.confidence = candidate.confidence
          
          console.log(`✅ Alternative URL screenshot successful for ${project.name}`)
          result.metadata.processingTime = Date.now() - startTime
          return result
        }
      }

      // Step 4: Fallback strategies
      console.log(`🔄 Using fallback strategies for ${project.name}`)
      return await this.useFallbackStrategies(project, result, startTime)

    } catch (error) {
      console.error(`❌ Smart screenshot failed for ${project.name}:`, error)
      
      // Still try fallback strategies even if there's an error
      try {
        return await this.useFallbackStrategies(project, result, startTime)
      } catch (fallbackError) {
        result.error = `Smart screenshot failed: ${error}. Fallback also failed: ${fallbackError}`
        result.metadata.processingTime = Date.now() - startTime
        return result
      }
    }
  }

  /**
   * Use fallback strategies when smart screenshot fails
   */
  private async useFallbackStrategies(
    project: ProjectInput,
    result: SmartScreenshotResult,
    startTime: number
  ): Promise<SmartScreenshotResult> {
    
    console.log(`🎨 Trying fallback strategies for ${project.name}`)
    
    const fallbackResult = await this.fallbackService.getBestFallback(
      project.name,
      project.githubUrl,
      project.framework,
      project.technologies
    )
    
    result.fallbackResult = fallbackResult
    result.metadata.totalAttempts++

    if (fallbackResult.success && fallbackResult.imagePath) {
      result.success = true
      result.finalImagePath = fallbackResult.imagePath
      result.strategy = fallbackResult.fallbackType === 'github_readme' ? 'fallback_readme' :
                       fallbackResult.fallbackType === 'cached_screenshot' ? 'fallback_cached' :
                       'fallback_placeholder'
      
      console.log(`✅ Fallback strategy successful for ${project.name}: ${result.strategy}`)
    } else {
      result.error = `All strategies failed. Last error: ${fallbackResult.error}`
      console.error(`❌ All fallback strategies failed for ${project.name}`)
    }

    result.metadata.processingTime = Date.now() - startTime
    return result
  }

  /**
   * Batch process multiple projects
   */
  async generateBulkSmartScreenshots(projects: ProjectInput[]): Promise<Map<string, SmartScreenshotResult>> {
    const results = new Map<string, SmartScreenshotResult>()
    
    console.log(`🚀 Starting bulk smart screenshot generation for ${projects.length} projects`)

    for (const project of projects) {
      try {
        const result = await this.generateSmartScreenshot(project)
        results.set(project.id, result)
        
        // Log progress
        const processed = results.size
        const successCount = Array.from(results.values()).filter(r => r.success).length
        console.log(`📊 Progress: ${processed}/${projects.length} (${successCount} successful)`)
        
        // Respectful delay between projects
        if (processed < projects.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error) {
        console.error(`Failed to process project ${project.name}:`, error)
        results.set(project.id, {
          projectId: project.id,
          success: false,
          strategy: 'smart_screenshot',
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            totalAttempts: 0,
            processingTime: 0
          }
        })
      }
    }

    // Summary
    const successCount = Array.from(results.values()).filter(r => r.success).length
    const strategyCount = Array.from(results.values()).reduce((acc, r) => {
      acc[r.strategy] = (acc[r.strategy] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log(`🎯 Bulk processing complete:`)
    console.log(`   Total: ${projects.length}`)
    console.log(`   Successful: ${successCount}`)
    console.log(`   Strategies used:`, strategyCount)

    return results
  }

  /**
   * Health check for a single URL
   */
  async quickHealthCheck(url: string): Promise<{
    accessible: boolean
    screenshotable: boolean
    confidence: number
    issues: string[]
  }> {
    const issues: string[] = []
    
    try {
      // Quick HTTP check
      const accessible = await this.urlTester.quickHealthCheck(url)
      if (!accessible) {
        issues.push('URL not accessible')
      }

      // Detailed check if accessible
      let screenshotable = false
      let confidence = 0

      if (accessible) {
        const candidate = await this.urlTester.testURLCandidate(url, 'manual')
        screenshotable = candidate.screenshotable
        confidence = candidate.confidence

        if (candidate.isLoginPage) issues.push('Login page detected')
        if (candidate.isErrorPage) issues.push('Error page detected')
        if (!candidate.hasMainContent) issues.push('No main content detected')
        if (candidate.loadTime > 15000) issues.push('Slow loading time')
      }

      return {
        accessible,
        screenshotable,
        confidence,
        issues
      }

    } catch (error) {
      issues.push(`Health check failed: ${error}`)
      return {
        accessible: false,
        screenshotable: false,
        confidence: 0,
        issues
      }
    }
  }

  /**
   * Clean up all services
   */
  async cleanup() {
    await Promise.all([
      this.urlTester.close(),
      this.screenshotService.close()
    ])
  }
}

// Singleton instance
let smartScreenshotOrchestrator: SmartScreenshotOrchestrator | null = null

export function getSmartScreenshotOrchestrator(): SmartScreenshotOrchestrator {
  if (!smartScreenshotOrchestrator) {
    smartScreenshotOrchestrator = new SmartScreenshotOrchestrator()
  }
  return smartScreenshotOrchestrator
}

export async function cleanupSmartScreenshotOrchestrator() {
  if (smartScreenshotOrchestrator) {
    await smartScreenshotOrchestrator.cleanup()
    smartScreenshotOrchestrator = null
  }
}