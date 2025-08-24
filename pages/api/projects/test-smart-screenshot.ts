import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get all projects for testing
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          url: true,
          imageUrl: true,
          isVisible: true
        },
        orderBy: { name: 'asc' }
      })
      
      // Return simple test interface data
      res.status(200).json({
        message: 'Smart Screenshot Test Interface',
        projectCount: projects.length,
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          currentUrl: p.url,
          hasScreenshot: !!p.imageUrl,
          isVisible: p.isVisible,
          testEndpoint: `/api/projects/smart-screenshot`,
          testPayload: { projectId: p.id }
        }))
      })
      
    } catch (error) {
      res.status(500).json({
        error: 'Failed to load test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}