import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Map of Vercel preview URLs to actual live URLs
const URL_MAPPINGS: Record<string, string> = {
  // Add your project URL mappings here
  // Example:
  // 'northscale.vercel.app': 'https://northscale.com',
  // 'quizsmart.vercel.app': 'https://quizsmart.app',
  // 'project-name.vercel.app': 'https://actual-domain.com',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Get all projects with Vercel URLs
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { url: { contains: '.vercel.app' } },
            { url: { contains: 'vercel.com' } }
          ]
        }
      })

      console.log(`Found ${projects.length} projects with Vercel URLs`)

      const updates = []
      
      for (const project of projects) {
        if (!project.url) continue
        
        // Check if we have a mapping for this URL
        const urlParts = new URL(project.url)
        const domain = urlParts.hostname
        
        if (URL_MAPPINGS[domain]) {
          updates.push({
            id: project.id,
            name: project.name,
            oldUrl: project.url,
            newUrl: URL_MAPPINGS[domain]
          })
          
          // Update the project
          await prisma.project.update({
            where: { id: project.id },
            data: { url: URL_MAPPINGS[domain] }
          })
        }
      }

      res.status(200).json({
        message: 'URLs updated successfully',
        updatedCount: updates.length,
        updates
      })
    } catch (error) {
      console.error('Error updating URLs:', error)
      res.status(500).json({
        error: 'Failed to update URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}