import type { NextApiRequest, NextApiResponse } from 'next'
import { createVercelClient } from '@/lib/vercel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { projectId } = req.query
      
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ error: 'Project ID is required' })
      }

      const vercel = createVercelClient()
      
      console.log(`🔍 Testing preview image for project: ${projectId}`)
      
      // Get project info
      const project = await vercel.getProject(projectId)
      console.log(`📋 Project found: ${project.name}`)
      
      // Test all preview image methods
      const previewImage = await vercel.getProjectPreviewImage(project)
      
      if (previewImage) {
        console.log(`✅ Preview image found: ${previewImage}`)
        res.status(200).json({
          success: true,
          projectName: project.name,
          previewImage,
          message: 'Preview image found successfully'
        })
      } else {
        console.log(`❌ No preview image found for ${project.name}`)
        res.status(404).json({
          success: false,
          projectName: project.name,
          previewImage: null,
          message: 'No preview image available'
        })
      }
      
    } catch (error) {
      console.error('Error testing Vercel preview:', error)
      res.status(500).json({
        error: 'Failed to test Vercel preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}