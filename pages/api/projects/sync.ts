import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createVercelClient, VercelProject } from '@/lib/vercel'
import { generateProjectScreenshot } from '@/lib/screenshot'
import { urlValidator } from '@/lib/url-validator'
import { getSmartScreenshotOrchestrator, ProjectInput } from '@/lib/smart-screenshot-orchestrator'

async function syncProjectsFromVercel() {
  const vercel = createVercelClient()
  const { projects: vercelProjects } = await vercel.getProjects()
  
  const syncedProjects = []
  
  for (const vercelProject of vercelProjects) {
    try {
      // Get the latest production deployment to get the live URL
      const latestDeployment = await vercel.getLatestDeployment(vercelProject.id)
      
      // Build a list of potential URLs to test
      const candidateUrls: string[] = []
      
      // Add custom domains first (highest priority)
      if (vercelProject.alias && vercelProject.alias.length > 0) {
        vercelProject.alias.forEach(alias => {
          candidateUrls.push(`https://${alias.domain}`)
        })
      }
      
      // Check production target for custom domains
      if (vercelProject.targets?.production?.alias && vercelProject.targets.production.alias.length > 0) {
        vercelProject.targets.production.alias.forEach(domain => {
          if (!candidateUrls.includes(`https://${domain}`)) {
            candidateUrls.push(`https://${domain}`)
          }
        })
      }
      
      // Add Vercel deployment URL with higher priority
      if (latestDeployment?.url) {
        // The deployment URL from Vercel should be the actual live URL
        const deploymentUrl = `https://${latestDeployment.url}`
        console.log(`📍 Latest deployment URL for ${vercelProject.name}: ${deploymentUrl}`)
        // Add it at the beginning for higher priority
        candidateUrls.unshift(deploymentUrl)
      }
      
      // Try some common URL patterns for the project name
      if (vercelProject.name && candidateUrls.length === 0) {
        const projectName = vercelProject.name.toLowerCase()
        // Only add these if we have no custom domains
        candidateUrls.push(`https://${projectName}.com`)
        candidateUrls.push(`https://www.${projectName}.com`)
        candidateUrls.push(`https://${projectName}.vercel.app`)
      }
      
      // Find the best accessible URL
      const liveUrl = await urlValidator.findBestURL(candidateUrls)
      
      // Check if project already exists
      let project = await prisma.project.findUnique({
        where: { vercelId: vercelProject.id }
      })
      
      if (project) {
        // Update existing project
        project = await prisma.project.update({
          where: { id: project.id },
          data: {
            name: vercelProject.name,
            url: liveUrl || project.url,
            framework: vercelProject.framework || project.framework,
            updatedAt: new Date(),
          },
        })
      } else {
        console.log(`🔍 Fetching enhanced info for new project: ${vercelProject.name}`)
        
        // Get enhanced project information from GitHub
        const enhancedInfo = await vercel.getEnhancedProjectInfo(vercelProject)
        
        // Try to get preview image from Vercel first, then generate screenshot
        let screenshotPath: string | null = null
        
        try {
          console.log(`🖼️ Attempting to get Vercel preview image for: ${vercelProject.name}`)
          screenshotPath = await vercel.getProjectPreviewImage(vercelProject)
          
          if (screenshotPath) {
            console.log(`✅ Got Vercel preview image for ${vercelProject.name}`)
          }
        } catch (error) {
          console.error(`Failed to get Vercel preview for ${vercelProject.name}:`, error)
        }
        
        // Fallback to generating smart screenshot if no Vercel preview
        if (!screenshotPath) {
          try {
            console.log(`🚀 Generating smart screenshot for project: ${vercelProject.name}`)
            
            const projectInput: ProjectInput = {
              id: vercelProject.id,
              name: vercelProject.name,
              vercelUrl: liveUrl || undefined,
              githubUrl: enhancedInfo.githubUrl || undefined,
              framework: vercelProject.framework || undefined,
              technologies: enhancedInfo.topics || [],
              description: enhancedInfo.description || undefined
            }

            const orchestrator = getSmartScreenshotOrchestrator()
            const smartResult = await orchestrator.generateSmartScreenshot(projectInput)
            
            if (smartResult.success && smartResult.finalImagePath) {
              screenshotPath = smartResult.finalImagePath
              console.log(`✅ Generated smart screenshot for ${vercelProject.name} using strategy: ${smartResult.strategy}`)
            } else {
              console.warn(`⚠️ Smart screenshot failed for ${vercelProject.name}: ${smartResult.error}`)
            }
          } catch (error) {
            console.error(`Failed to generate smart screenshot for ${vercelProject.name}:`, error)
          }
        }
        
        if (!screenshotPath) {
          console.warn(`⚠️ No preview image available for ${vercelProject.name}`)
        }
        
        // Determine project type and category based on framework and language
        const getProjectDetails = (framework: string | null, language: string | null) => {
          const fw = framework?.toLowerCase() || ''
          const lang = language?.toLowerCase() || ''
          
          if (fw.includes('nextjs') || fw.includes('next')) {
            return { type: 'Web App', category: 'fullstack', difficulty: 'intermediate' }
          } else if (fw.includes('react')) {
            return { type: 'Web App', category: 'frontend', difficulty: 'beginner' }
          } else if (fw.includes('vue') || fw.includes('nuxt')) {
            return { type: 'Web App', category: 'frontend', difficulty: 'intermediate' }
          } else if (fw.includes('svelte')) {
            return { type: 'Web App', category: 'frontend', difficulty: 'intermediate' }
          } else if (fw.includes('node') || fw.includes('express') || lang.includes('javascript')) {
            return { type: 'API', category: 'backend', difficulty: 'intermediate' }
          } else if (fw.includes('gatsby') || fw.includes('hugo')) {
            return { type: 'Static Site', category: 'frontend', difficulty: 'beginner' }
          } else if (lang.includes('python')) {
            return { type: 'Web App', category: 'backend', difficulty: 'intermediate' }
          } else if (lang.includes('typescript')) {
            return { type: 'Web App', category: 'fullstack', difficulty: 'advanced' }
          } else {
            return { type: 'Web App', category: 'fullstack', difficulty: 'intermediate' }
          }
        }
        
        const projectDetails = getProjectDetails(vercelProject.framework, enhancedInfo.primaryLanguage)
        
        // Determine if project should be featured based on criteria
        const shouldBeFeatured = (
          enhancedInfo.topics.includes('featured') ||
          enhancedInfo.topics.includes('portfolio') ||
          (screenshotPath && enhancedInfo.description.length > 50) ||
          vercelProject.name.toLowerCase().includes('portfolio') ||
          enhancedInfo.primaryLanguage === 'TypeScript'
        )
        
        // Create new project (visible by default now) with enhanced information
        project = await prisma.project.create({
          data: {
            vercelId: vercelProject.id,
            name: vercelProject.name,
            description: enhancedInfo.description,
            longDescription: enhancedInfo.longDescription,
            url: liveUrl,
            liveUrl: liveUrl,
            githubUrl: enhancedInfo.githubUrl,
            imageUrl: screenshotPath,
            framework: vercelProject.framework,
            projectType: projectDetails.type,
            category: projectDetails.category,
            status: 'completed',
            difficulty: projectDetails.difficulty,
            featured: shouldBeFeatured,
            isVisible: true, // Visible by default
            displayOrder: 0,
            projectStartDate: new Date(vercelProject.createdAt || Date.now()),
            projectEndDate: new Date(),
          },
        })
        
        // Add framework as a technology if available
        if (vercelProject.framework) {
          const getTechCategory = (tech: string) => {
            const t = tech.toLowerCase()
            if (t.includes('react') || t.includes('vue') || t.includes('svelte')) return 'frontend'
            if (t.includes('node') || t.includes('express') || t.includes('fastify')) return 'backend'
            if (t.includes('next') || t.includes('nuxt') || t.includes('gatsby')) return 'frontend'
            return 'frontend'
          }
          
          await prisma.projectTechnology.create({
            data: {
              projectId: project.id,
              technology: vercelProject.framework,
              category: getTechCategory(vercelProject.framework),
              level: 'primary',
            },
          })
          
          // Add some common technologies based on the framework
          const additionalTechs = []
          const fw = vercelProject.framework.toLowerCase()
          
          if (fw.includes('next')) {
            additionalTechs.push(
              { name: 'React', category: 'frontend', level: 'primary' },
              { name: 'TypeScript', category: 'frontend', level: 'secondary' },
              { name: 'Vercel', category: 'deployment', level: 'secondary' }
            )
          } else if (fw.includes('react')) {
            additionalTechs.push(
              { name: 'JavaScript', category: 'frontend', level: 'primary' },
              { name: 'Vercel', category: 'deployment', level: 'secondary' }
            )
          }
          
          // Add additional technologies
          for (const tech of additionalTechs) {
            try {
              await prisma.projectTechnology.create({
                data: {
                  projectId: project.id,
                  technology: tech.name,
                  category: tech.category,
                  level: tech.level,
                },
              })
            } catch (error) {
              // Ignore duplicate technology errors
              console.log(`Technology ${tech.name} already exists for project ${project.name}`)
            }
          }

          // Add GitHub topics as technologies
          if (enhancedInfo.topics.length > 0) {
            const techCategories: Record<string, string> = {
              'frontend': 'frontend',
              'backend': 'backend',
              'react': 'frontend',
              'vue': 'frontend',
              'angular': 'frontend',
              'node': 'backend',
              'express': 'backend',
              'api': 'backend',
              'database': 'database',
              'mongodb': 'database',
              'postgresql': 'database',
              'mysql': 'database',
              'typescript': 'frontend',
              'javascript': 'frontend',
              'python': 'backend',
              'nextjs': 'frontend',
              'tailwind': 'frontend',
              'css': 'frontend',
              'html': 'frontend',
              'docker': 'deployment',
              'vercel': 'deployment',
              'aws': 'deployment',
              'testing': 'testing',
              'jest': 'testing'
            }

            for (const topic of enhancedInfo.topics.slice(0, 5)) { // Limit to 5 topics
              try {
                await prisma.projectTechnology.create({
                  data: {
                    projectId: project.id,
                    technology: topic,
                    category: techCategories[topic.toLowerCase()] || 'frontend',
                    level: 'minor',
                  },
                })
              } catch (error) {
                // Ignore duplicate technology errors
                console.log(`Topic ${topic} already exists for project ${project.name}`)
              }
            }
          }

          // Add primary language as technology if not already added
          if (enhancedInfo.primaryLanguage && enhancedInfo.primaryLanguage !== vercelProject.framework) {
            try {
              await prisma.projectTechnology.create({
                data: {
                  projectId: project.id,
                  technology: enhancedInfo.primaryLanguage,
                  category: enhancedInfo.primaryLanguage.toLowerCase().includes('typescript') || 
                           enhancedInfo.primaryLanguage.toLowerCase().includes('javascript') ? 'frontend' : 'backend',
                  level: 'primary',
                },
              })
            } catch (error) {
              console.log(`Language ${enhancedInfo.primaryLanguage} already exists for project ${project.name}`)
            }
          }
        }
      }
      
      syncedProjects.push(project)
    } catch (error) {
      console.error(`Failed to sync project ${vercelProject.name}:`, error)
    }
  }
  
  return syncedProjects
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Simple auth check - in production, use proper authentication
      const authHeader = req.headers.authorization
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const syncedProjects = await syncProjectsFromVercel()
      
      res.status(200).json({ 
        message: 'Projects synced successfully',
        syncedCount: syncedProjects.length,
        projects: syncedProjects
      })
    } catch (error) {
      console.error('Error syncing projects:', error)
      res.status(500).json({ 
        error: 'Failed to sync projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}