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
        longDescription: project.longDescription || project.description || '',
        image: project.imageUrl || '',
        url: project.url || project.liveUrl || '',
        githubUrl: project.githubUrl,
        stack: project.technologies.map(tech => tech.technology),
        projectType: project.projectType || 'Web App',
        category: project.category || 'fullstack',
        status: project.status || 'completed',
        difficulty: project.difficulty || 'intermediate',
        featured: project.featured || false,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        projectStartDate: project.projectStartDate,
        projectEndDate: project.projectEndDate,
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