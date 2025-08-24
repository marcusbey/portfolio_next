import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createVercelClient } from '@/lib/vercel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get all projects with potential Vercel URLs
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { url: { contains: '.vercel.app' } },
            { url: { contains: 'vercel.com' } },
            { url: null }
          ]
        },
        orderBy: { name: 'asc' }
      })

      const vercel = createVercelClient()
      const projectsWithSuggestions = []

      for (const project of projects) {
        let suggestedUrls: string[] = []
        
        if (project.vercelId) {
          try {
            // Get the Vercel project details
            const vercelProject = await vercel.getProject(project.vercelId)
            
            // Get custom domains
            if (vercelProject.alias && vercelProject.alias.length > 0) {
              suggestedUrls = vercelProject.alias.map(alias => `https://${alias.domain}`)
            }
            
            // Also check targets
            if (vercelProject.targets?.production?.alias) {
              const additionalDomains = vercelProject.targets.production.alias
                .map(domain => `https://${domain}`)
                .filter(url => !suggestedUrls.includes(url))
              suggestedUrls.push(...additionalDomains)
            }
          } catch (error) {
            console.error(`Failed to get Vercel project details for ${project.name}:`, error)
          }
        }

        // Add common URL patterns as suggestions
        const projectName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const commonPatterns = [
          `https://${projectName}.com`,
          `https://www.${projectName}.com`,
          `https://${projectName}.app`,
          `https://${projectName}.io`
        ]
        
        projectsWithSuggestions.push({
          id: project.id,
          name: project.name,
          currentUrl: project.url,
          suggestedUrls: [...suggestedUrls, ...commonPatterns],
          hasVercelUrl: project.url?.includes('.vercel.app') || project.url?.includes('vercel.com'),
          hasCustomDomain: suggestedUrls.length > 0
        })
      }

      res.status(200).json({
        projectsNeedingFix: projectsWithSuggestions.filter(p => p.hasVercelUrl || !p.currentUrl),
        totalProjects: projectsWithSuggestions.length,
        message: 'Review the suggested URLs and update projects using the admin panel or API'
      })
    } catch (error) {
      console.error('Error analyzing project URLs:', error)
      res.status(500).json({
        error: 'Failed to analyze project URLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else if (req.method === 'POST') {
    try {
      const { projectId, newUrl } = req.body

      if (!projectId || !newUrl) {
        return res.status(400).json({ error: 'Project ID and new URL are required' })
      }

      // Update the project URL
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { url: newUrl }
      })

      res.status(200).json({
        message: 'Project URL updated successfully',
        project: updatedProject
      })
    } catch (error) {
      console.error('Error updating project URL:', error)
      res.status(500).json({
        error: 'Failed to update project URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}