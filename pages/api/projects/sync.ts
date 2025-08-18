import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createVercelClient, VercelProject } from '@/lib/vercel'
import { generateProjectScreenshot } from '@/lib/screenshot'

async function syncProjectsFromVercel() {
  const vercel = createVercelClient()
  const { projects: vercelProjects } = await vercel.getProjects()
  
  const syncedProjects = []
  
  for (const vercelProject of vercelProjects) {
    try {
      // Get the latest production deployment to get the live URL
      const latestDeployment = await vercel.getLatestDeployment(vercelProject.id)
      const liveUrl = latestDeployment?.url ? `https://${latestDeployment.url}` : undefined
      
      // Check if project already exists
      let project = await prisma.project.findUnique({
        where: { vercelId: vercelProject.id }
      })
      
      if (project) {
        // Update existing project
        project = await prisma.project.update({
          where: { id: project.id },
          data: {
            name: vercelProject.name,
            url: liveUrl || project.url,
            framework: vercelProject.framework || project.framework,
            updatedAt: new Date(),
          },
        })
      } else {
        // Generate screenshot for new project if it has a URL
        let screenshotPath: string | null = null
        if (liveUrl) {
          try {
            console.log(`📸 Generating screenshot for new project: ${vercelProject.name}`)
            screenshotPath = await generateProjectScreenshot(liveUrl, vercelProject.name)
          } catch (error) {
            console.error(`Failed to generate screenshot for ${vercelProject.name}:`, error)
          }
        }
        
        // Create new project (not visible by default)
        project = await prisma.project.create({
          data: {
            vercelId: vercelProject.id,
            name: vercelProject.name,
            description: `Project deployed on Vercel`,
            url: liveUrl,
            imageUrl: screenshotPath,
            framework: vercelProject.framework,
            isVisible: false,
            displayOrder: 0,
          },
        })
        
        // Add framework as a technology if available
        if (vercelProject.framework) {
          await prisma.projectTechnology.create({
            data: {
              projectId: project.id,
              technology: vercelProject.framework,
            },
          })
        }
      }
      
      syncedProjects.push(project)
    } catch (error) {
      console.error(`Failed to sync project ${vercelProject.name}:`, error)
    }
  }
  
  return syncedProjects
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Simple auth check - in production, use proper authentication
      const authHeader = req.headers.authorization
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const syncedProjects = await syncProjectsFromVercel()
      
      res.status(200).json({ 
        message: 'Projects synced successfully',
        syncedCount: syncedProjects.length,
        projects: syncedProjects
      })
    } catch (error) {
      console.error('Error syncing projects:', error)
      res.status(500).json({ 
        error: 'Failed to sync projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}