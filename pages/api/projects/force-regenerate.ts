import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProjectScreenshot } from '@/lib/screenshot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { projectId, forceUrl } = req.body

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

      const urlToUse = forceUrl || project.url
      
      if (!urlToUse) {
        return res.status(400).json({ error: 'No URL available for screenshot generation' })
      }

      console.log(`🔄 Force regenerating screenshot for project: ${project.name}`)
      console.log(`📍 Using URL: ${urlToUse}`)

      // Update URL if different
      if (forceUrl && forceUrl !== project.url) {
        await prisma.project.update({
          where: { id: projectId },
          data: { url: forceUrl }
        })
      }

      // Generate screenshot with the specific URL
      const screenshotPath = await generateProjectScreenshot(urlToUse, project.name)

      if (screenshotPath) {
        // Update project with new screenshot
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
          screenshotPath,
          usedUrl: urlToUse
        })
      } else {
        res.status(500).json({ 
          error: 'Failed to generate screenshot',
          message: 'Check console logs for details about why the screenshot failed',
          attemptedUrl: urlToUse
        })
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