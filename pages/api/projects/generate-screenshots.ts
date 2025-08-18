import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getScreenshotGenerator } from '@/lib/screenshot'

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
    const { projectId, projectIds } = req.body
    
    if (projectId) {
      // Generate screenshot for single project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })
      
      if (!project || !project.url) {
        return res.status(400).json({ error: 'Project not found or no URL' })
      }
      
      console.log(`📸 Generating screenshot for ${project.name}...`)
      
      const generator = getScreenshotGenerator()
      const screenshotPath = await generator.generateScreenshot({
        url: project.url,
        projectName: project.name,
      })
      
      if (screenshotPath) {
        // Update project with screenshot path
        await prisma.project.update({
          where: { id: projectId },
          data: { imageUrl: screenshotPath },
        })
        
        return res.status(200).json({
          success: true,
          message: 'Screenshot generated successfully',
          screenshotPath,
        })
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate screenshot',
        })
      }
      
    } else if (projectIds && Array.isArray(projectIds)) {
      // Generate screenshots for multiple projects
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          url: { not: null },
        },
      })
      
      const generator = getScreenshotGenerator()
      const results = await generator.generateBulkScreenshots(
        projects.map(p => ({ url: p.url!, name: p.name, id: p.id }))
      )
      
      // Update projects with screenshot paths
      const updatePromises = []
      for (const [projectId, screenshotPath] of results.entries()) {
        if (screenshotPath) {
          updatePromises.push(
            prisma.project.update({
              where: { id: projectId },
              data: { imageUrl: screenshotPath },
            })
          )
        }
      }
      
      await Promise.all(updatePromises)
      
      const successCount = Array.from(results.values()).filter(Boolean).length
      
      return res.status(200).json({
        success: true,
        message: `Generated ${successCount} screenshots out of ${projects.length} projects`,
        results: Object.fromEntries(results),
      })
      
    } else {
      // Generate screenshots for all projects with URLs
      const projects = await prisma.project.findMany({
        where: {
          url: { not: null },
          imageUrl: null, // Only generate for projects without existing images
        },
      })
      
      if (projects.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No projects need screenshots',
        })
      }
      
      const generator = getScreenshotGenerator()
      const results = await generator.generateBulkScreenshots(
        projects.map(p => ({ url: p.url!, name: p.name, id: p.id }))
      )
      
      // Update projects with screenshot paths
      const updatePromises = []
      for (const [projectId, screenshotPath] of results.entries()) {
        if (screenshotPath) {
          updatePromises.push(
            prisma.project.update({
              where: { id: projectId },
              data: { imageUrl: screenshotPath },
            })
          )
        }
      }
      
      await Promise.all(updatePromises)
      
      const successCount = Array.from(results.values()).filter(Boolean).length
      
      return res.status(200).json({
        success: true,
        message: `Generated ${successCount} screenshots out of ${projects.length} projects`,
        results: Object.fromEntries(results),
      })
    }
    
  } catch (error) {
    console.error('Screenshot generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate screenshots',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}