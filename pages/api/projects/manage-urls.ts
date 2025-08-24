import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getSmartScreenshotOrchestrator } from '@/lib/smart-screenshot-orchestrator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simple auth check
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { projectId } = req.query

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' })
  }

  if (req.method === 'GET') {
    // Get project URLs and their health status
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          url: true,
          liveUrl: true,
          demoUrl: true,
          manualUrls: true,
          screenshotStrategy: true,
          screenshotMetadata: true,
          lastScreenshotAt: true
        }
      })

      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }

      // Collect all URLs
      const allUrls = [
        ...(project.url ? [project.url] : []),
        ...(project.liveUrl ? [project.liveUrl] : []),
        ...(project.demoUrl ? [project.demoUrl] : []),
        ...project.manualUrls
      ].filter((url, index, arr) => arr.indexOf(url) === index) // Remove duplicates

      // Check health of each URL
      const orchestrator = getSmartScreenshotOrchestrator()
      const urlHealthResults = await Promise.allSettled(
        allUrls.map(async (url) => {
          const health = await orchestrator.quickHealthCheck(url)
          return { url, health }
        })
      )

      const urlHealth = urlHealthResults.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            url: 'unknown',
            health: {
              accessible: false,
              screenshotable: false,
              confidence: 0,
              issues: ['Health check failed']
            }
          }
        }
      })

      return res.status(200).json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          urls: {
            primary: project.url,
            live: project.liveUrl,
            demo: project.demoUrl,
            manual: project.manualUrls
          },
          screenshotInfo: {
            strategy: project.screenshotStrategy,
            metadata: project.screenshotMetadata,
            lastGenerated: project.lastScreenshotAt
          }
        },
        urlHealth
      })

    } catch (error) {
      console.error('Failed to get project URLs:', error)
      return res.status(500).json({
        error: 'Failed to get project URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

  } else if (req.method === 'PUT') {
    // Update manual URLs for the project
    try {
      const { manualUrls } = req.body

      if (!Array.isArray(manualUrls)) {
        return res.status(400).json({ error: 'manualUrls must be an array' })
      }

      // Validate URLs
      const validUrls = []
      const invalidUrls = []

      for (const url of manualUrls) {
        try {
          new URL(url)
          validUrls.push(url)
        } catch {
          invalidUrls.push(url)
        }
      }

      if (invalidUrls.length > 0) {
        return res.status(400).json({
          error: 'Invalid URLs provided',
          invalidUrls
        })
      }

      // Update project with new manual URLs
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { manualUrls: validUrls },
        select: {
          id: true,
          name: true,
          manualUrls: true
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Manual URLs updated successfully',
        project: updatedProject
      })

    } catch (error) {
      console.error('Failed to update manual URLs:', error)
      return res.status(500).json({
        error: 'Failed to update manual URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

  } else if (req.method === 'POST') {
    // Test URLs and optionally generate screenshot with best URL
    try {
      const { testUrls, generateScreenshot = false } = req.body

      if (!Array.isArray(testUrls) || testUrls.length === 0) {
        return res.status(400).json({ error: 'testUrls array is required' })
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { technologies: true }
      })

      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }

      // Test all URLs
      const orchestrator = getSmartScreenshotOrchestrator()
      
      const urlTests = await Promise.allSettled(
        testUrls.map(async (url: string) => {
          const health = await orchestrator.quickHealthCheck(url)
          return { url, health }
        })
      )

      const urlResults = urlTests.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            url: 'unknown',
            health: {
              accessible: false,
              screenshotable: false,
              confidence: 0,
              issues: ['Test failed']
            }
          }
        }
      })

      // Find best URL
      const bestUrl = urlResults
        .filter(r => r.health.screenshotable)
        .sort((a, b) => b.health.confidence - a.health.confidence)[0]

      let screenshotResult = null

      if (generateScreenshot && bestUrl) {
        const projectInput = {
          id: project.id,
          name: project.name,
          vercelUrl: bestUrl.url,
          githubUrl: project.githubUrl || undefined,
          framework: project.framework || undefined,
          technologies: project.technologies.map(t => t.technology),
          description: project.description || undefined,
          manualUrls: testUrls
        }

        screenshotResult = await orchestrator.generateSmartScreenshot(projectInput)

        if (screenshotResult.success && screenshotResult.finalImagePath) {
          // Update project with new screenshot
          await prisma.project.update({
            where: { id: projectId },
            data: {
              imageUrl: screenshotResult.finalImagePath,
              screenshotStrategy: screenshotResult.strategy,
              screenshotMetadata: screenshotResult.metadata,
              lastScreenshotAt: new Date()
            }
          })
        }
      }

      return res.status(200).json({
        success: true,
        message: 'URLs tested successfully',
        urlResults,
        bestUrl: bestUrl?.url || null,
        screenshotResult: screenshotResult ? {
          success: screenshotResult.success,
          strategy: screenshotResult.strategy,
          imagePath: screenshotResult.finalImagePath,
          error: screenshotResult.error
        } : null
      })

    } catch (error) {
      console.error('Failed to test URLs:', error)
      return res.status(500).json({
        error: 'Failed to test URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}