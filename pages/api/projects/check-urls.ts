import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get all projects with their URLs
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          url: true,
          vercelId: true,
          imageUrl: true
        },
        orderBy: { name: 'asc' }
      })

      // Check each URL
      const urlChecks = await Promise.all(
        projects.map(async (project) => {
          if (!project.url) {
            return {
              ...project,
              status: 'no-url',
              accessible: false
            }
          }

          try {
            const response = await fetch(project.url, {
              method: 'HEAD',
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ProjectChecker/1.0)'
              }
            })

            // Check if we got redirected to a login page
            const finalUrl = response.url
            const isLoginRedirect = finalUrl.includes('vercel.com/login') || 
                                  finalUrl.includes('/auth') ||
                                  finalUrl.includes('sign-in')

            return {
              ...project,
              status: response.status,
              accessible: response.ok && !isLoginRedirect,
              finalUrl: finalUrl !== project.url ? finalUrl : undefined,
              isLoginRedirect
            }
          } catch (error) {
            return {
              ...project,
              status: 'error',
              accessible: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      // Separate accessible and inaccessible projects
      const accessibleProjects = urlChecks.filter(p => p.accessible)
      const inaccessibleProjects = urlChecks.filter(p => !p.accessible)

      res.status(200).json({
        total: projects.length,
        accessible: accessibleProjects.length,
        inaccessible: inaccessibleProjects.length,
        projects: {
          accessible: accessibleProjects,
          needsAttention: inaccessibleProjects
        },
        suggestion: "For Vercel preview URLs showing login screens, you may need to: 1) Make the deployment public in Vercel dashboard, 2) Use a custom domain, or 3) Use the project's actual production URL"
      })
    } catch (error) {
      console.error('Error checking URLs:', error)
      res.status(500).json({
        error: 'Failed to check URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}