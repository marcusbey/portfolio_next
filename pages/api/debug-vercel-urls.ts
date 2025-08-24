import type { NextApiRequest, NextApiResponse } from 'next'
import { createVercelClient } from '@/lib/vercel'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const vercel = createVercelClient()
      
      // Get all Vercel projects
      const { projects: vercelProjects } = await vercel.getProjects()
      
      const projectDetails = await Promise.all(
        vercelProjects.slice(0, 5).map(async (project) => {
          // Get latest deployment
          const latestDeployment = await vercel.getLatestDeployment(project.id)
          
          // Get the project from our database
          const dbProject = await prisma.project.findUnique({
            where: { vercelId: project.id }
          })
          
          return {
            name: project.name,
            vercelId: project.id,
            // From Vercel API
            vercelData: {
              alias: project.alias,
              targets: project.targets,
              link: project.link,
              latestDeploymentUrl: latestDeployment?.url,
              latestDeploymentState: latestDeployment?.state,
              latestDeploymentTarget: latestDeployment?.target,
            },
            // From our database
            currentDbUrl: dbProject?.url,
            // Possible URLs
            possibleUrls: [
              ...(project.alias || []).map(a => `https://${a.domain}`),
              ...(project.targets?.production?.alias || []).map(a => `https://${a}`),
              latestDeployment?.url ? `https://${latestDeployment.url}` : null,
              `https://${project.name}.vercel.app`
            ].filter(Boolean)
          }
        })
      )
      
      res.status(200).json({
        projects: projectDetails,
        message: 'Check the URLs to see what Vercel is providing'
      })
    } catch (error) {
      console.error('Error debugging Vercel URLs:', error)
      res.status(500).json({
        error: 'Failed to debug Vercel URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}