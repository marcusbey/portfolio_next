import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getSmartScreenshotOrchestrator, ProjectInput } from '@/lib/smart-screenshot-orchestrator'

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
    const { projectId, projectIds, forceRegenerate = false } = req.body
    
    if (projectId) {
      // Generate smart screenshot for single project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          technologies: true
        }
      })
      
      if (!project) {
        return res.status(400).json({ error: 'Project not found' })
      }

      // Check if we should skip (has image and not forcing regeneration)
      if (project.imageUrl && !forceRegenerate) {
        return res.status(200).json({
          success: true,
          message: 'Project already has screenshot',
          skipped: true,
          existingImageUrl: project.imageUrl
        })
      }
      
      console.log(`🚀 Generating smart screenshot for ${project.name}...`)
      
      const projectInput: ProjectInput = {
        id: project.id,
        name: project.name,
        vercelUrl: project.url || undefined,
        githubUrl: project.githubUrl || undefined,
        framework: project.framework || undefined,
        technologies: project.technologies.map(t => t.technology),
        description: project.description || undefined
      }

      const orchestrator = getSmartScreenshotOrchestrator()
      const result = await orchestrator.generateSmartScreenshot(projectInput)
      
      if (result.success && result.finalImagePath) {
        // Update project with screenshot path and metadata
        await prisma.project.update({
          where: { id: projectId },
          data: { 
            imageUrl: result.finalImagePath,
            screenshotStrategy: result.strategy,
            screenshotMetadata: result.metadata,
            lastScreenshotAt: new Date()
          },
        })
        
        return res.status(200).json({
          success: true,
          message: 'Smart screenshot generated successfully',
          screenshotPath: result.finalImagePath,
          strategy: result.strategy,
          metadata: result.metadata
        })
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate smart screenshot',
          error: result.error,
          metadata: result.metadata
        })
      }
      
    } else if (projectIds && Array.isArray(projectIds)) {
      // Generate smart screenshots for multiple projects
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          ...(forceRegenerate ? {} : { imageUrl: null }) // Only projects without images unless forcing
        },
        include: {
          technologies: true
        }
      })
      
      if (projects.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No projects need smart screenshots',
          skipped: projectIds.length
        })
      }
      
      const projectInputs: ProjectInput[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        vercelUrl: project.url || undefined,
        githubUrl: project.githubUrl || undefined,
        framework: project.framework || undefined,
        technologies: project.technologies.map(t => t.technology),
        description: project.description || undefined
      }))
      
      const orchestrator = getSmartScreenshotOrchestrator()
      const results = await orchestrator.generateBulkSmartScreenshots(projectInputs)
      
      // Update projects with screenshot paths and metadata
      const updatePromises = []
      for (const [projectId, result] of Array.from(results.entries())) {
        if (result.success && result.finalImagePath) {
          updatePromises.push(
            prisma.project.update({
              where: { id: projectId },
              data: { 
                imageUrl: result.finalImagePath,
                screenshotStrategy: result.strategy,
                screenshotMetadata: result.metadata,
                lastScreenshotAt: new Date()
              },
            })
          )
        }
      }
      
      await Promise.all(updatePromises)
      
      const successCount = Array.from(results.values()).filter(r => r.success).length
      const strategyStats = Array.from(results.values()).reduce((acc, r) => {
        acc[r.strategy] = (acc[r.strategy] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return res.status(200).json({
        success: true,
        message: `Generated ${successCount} smart screenshots out of ${projects.length} projects`,
        successCount,
        totalProjects: projects.length,
        strategyStats,
        results: Object.fromEntries(
          Array.from(results.entries()).map(([id, result]) => [
            id,
            {
              success: result.success,
              strategy: result.strategy,
              imagePath: result.finalImagePath,
              error: result.error,
              metadata: result.metadata
            }
          ])
        )
      })
      
    } else {
      // Generate smart screenshots for all projects needing them
      const projects = await prisma.project.findMany({
        where: forceRegenerate ? {} : {
          imageUrl: null, // Only generate for projects without existing images
        },
        include: {
          technologies: true
        }
      })
      
      if (projects.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No projects need smart screenshots',
        })
      }
      
      const projectInputs: ProjectInput[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        vercelUrl: project.url || undefined,
        githubUrl: project.githubUrl || undefined,
        framework: project.framework || undefined,
        technologies: project.technologies.map(t => t.technology),
        description: project.description || undefined
      }))
      
      const orchestrator = getSmartScreenshotOrchestrator()
      const results = await orchestrator.generateBulkSmartScreenshots(projectInputs)
      
      // Update projects with screenshot paths and metadata
      const updatePromises = []
      for (const [projectId, result] of Array.from(results.entries())) {
        if (result.success && result.finalImagePath) {
          updatePromises.push(
            prisma.project.update({
              where: { id: projectId },
              data: { 
                imageUrl: result.finalImagePath,
                screenshotStrategy: result.strategy,
                screenshotMetadata: result.metadata,
                lastScreenshotAt: new Date()
              },
            })
          )
        }
      }
      
      await Promise.all(updatePromises)
      
      const successCount = Array.from(results.values()).filter(r => r.success).length
      const strategyStats = Array.from(results.values()).reduce((acc, r) => {
        acc[r.strategy] = (acc[r.strategy] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return res.status(200).json({
        success: true,
        message: `Generated ${successCount} smart screenshots out of ${projects.length} projects`,
        successCount,
        totalProjects: projects.length,
        strategyStats,
        results: Object.fromEntries(
          Array.from(results.entries()).map(([id, result]) => [
            id,
            {
              success: result.success,
              strategy: result.strategy,
              imagePath: result.finalImagePath,
              error: result.error,
              metadata: result.metadata
            }
          ])
        )
      })
    }
    
  } catch (error) {
    console.error('Smart screenshot generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate smart screenshots',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}