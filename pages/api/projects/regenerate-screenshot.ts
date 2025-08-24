import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProjectScreenshot } from '@/lib/screenshot'
import { createVercelClient } from '@/lib/vercel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { projectId } = req.body

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' })
      }

      // Get the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }

      if (!project.url) {
        return res.status(400).json({ error: 'Project has no URL for screenshot generation' })
      }

      console.log(`🔄 Regenerating screenshot for project: ${project.name}`)

      let screenshotPath: string | null = null

      // Try Vercel preview first if project has vercelId
      if (project.vercelId) {
        try {
          const vercel = createVercelClient()
          const vercelProject = await vercel.getProject(project.vercelId)
          screenshotPath = await vercel.getProjectPreviewImage(vercelProject)
          
          if (screenshotPath) {
            console.log(`✅ Got Vercel preview image for ${project.name}`)
          }
        } catch (error) {
          console.error(`Failed to get Vercel preview for ${project.name}:`, error)
        }
      }

      // Fallback to custom screenshot generation
      if (!screenshotPath) {
        try {
          console.log(`📸 Generating custom screenshot for: ${project.name}`)
          screenshotPath = await generateProjectScreenshot(project.url, project.name)
          
          if (screenshotPath) {
            console.log(`✅ Generated custom screenshot for ${project.name}`)
          }
        } catch (error) {
          console.error(`Failed to generate screenshot for ${project.name}:`, error)
          return res.status(500).json({ 
            error: 'Failed to generate screenshot',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Update project with new screenshot
      if (screenshotPath) {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { imageUrl: screenshotPath },
          include: {
            technologies: true,
          },
        })

        res.status(200).json({ 
          message: 'Screenshot regenerated successfully',
          project: updatedProject,
          screenshotPath
        })
      } else {
        res.status(500).json({ error: 'Failed to generate or retrieve screenshot' })
      }

    } catch (error) {
      console.error('Error regenerating screenshot:', error)
      res.status(500).json({ 
        error: 'Failed to regenerate screenshot',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}