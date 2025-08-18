import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
        where: {
          isVisible: true,
        },
        include: {
          technologies: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      })

      const formattedProjects = projects.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description || '',
        image: project.imageUrl || '',
        url: project.url || '',
        stack: project.technologies.map(tech => tech.technology),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }))

      res.status(200).json({ projects: formattedProjects })
    } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({ error: 'Failed to fetch projects' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}