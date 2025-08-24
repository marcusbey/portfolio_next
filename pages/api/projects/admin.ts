import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
        include: {
          technologies: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      })

      res.status(200).json({ projects })
    } catch (error) {
      console.error('Error fetching admin projects:', error)
      res.status(500).json({ error: 'Failed to fetch projects' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { 
        projectId, 
        isVisible, 
        displayOrder, 
        url, 
        description, 
        longDescription, 
        techStack, 
        imageUrls 
      } = req.body

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' })
      }

      const updateData: any = {}
      if (typeof isVisible === 'boolean') {
        updateData.isVisible = isVisible
      }
      if (typeof displayOrder === 'number') {
        updateData.displayOrder = displayOrder
      }
      if (typeof url === 'string') {
        updateData.url = url
        updateData.liveUrl = url // Also update liveUrl field
      }
      if (typeof description === 'string') {
        updateData.description = description
      }
      if (typeof longDescription === 'string') {
        updateData.longDescription = longDescription
      }
      if (Array.isArray(techStack)) {
        updateData.techStack = techStack
      }
      if (Array.isArray(imageUrls)) {
        updateData.imageUrls = imageUrls
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
          technologies: true,
        },
      })

      res.status(200).json({ project: updatedProject })
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({ error: 'Failed to update project' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}