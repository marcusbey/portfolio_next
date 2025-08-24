import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProjectScreenshot } from '@/lib/screenshot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { projectIds } = req.body
    
    if (!projectIds || !Array.isArray(projectIds)) {
      return res.status(400).json({ error: 'Project IDs array is required' })
    }
    
    console.log(`🔄 Force regenerating screenshots for ${projectIds.length} projects`)
    
    const results = []
    
    for (const projectId of projectIds) {
      try {
        // Get project
        const project = await prisma.project.findUnique({
          where: { id: projectId }
        })
        
        if (!project) {
          results.push({
            projectId,
            success: false,
            error: 'Project not found'
          })
          continue
        }
        
        if (!project.url) {
          results.push({
            projectId,
            projectName: project.name,
            success: false,
            error: 'No URL available'
          })
          continue
        }
        
        console.log(`📷 Generating screenshot for ${project.name}: ${project.url}`)
        
        // Generate screenshot with current URL
        const screenshotPath = await generateProjectScreenshot(project.url, project.name)
        
        if (screenshotPath) {
          // Update project with new screenshot
          await prisma.project.update({
            where: { id: projectId },
            data: { imageUrl: screenshotPath }
          })
          
          results.push({
            projectId,
            projectName: project.name,
            success: true,
            screenshotPath,
            url: project.url
          })
          console.log(`✅ Generated screenshot for ${project.name}`)
        } else {
          results.push({
            projectId,
            projectName: project.name,
            success: false,
            error: 'Screenshot generation failed',
            url: project.url
          })
          console.log(`❌ Failed to generate screenshot for ${project.name}`)
        }
        
        // Small delay between screenshots to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        results.push({
          projectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    res.status(200).json({
      message: 'Screenshot regeneration complete',
      successful,
      failed,
      results
    })
    
  } catch (error) {
    console.error('Force screenshot regeneration error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}