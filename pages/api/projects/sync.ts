import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createVercelClient, VercelProject } from '@/lib/vercel'
import { generateProjectScreenshot } from '@/lib/screenshot'
// Removed broken imports - using simple sync approach

async function syncProjectsFromVercel() {
  const vercel = createVercelClient()
  const { projects: vercelProjects } = await vercel.getProjects()
  
  const syncedProjects = []
  
  for (const vercelProject of vercelProjects) {
    try {
      // Get the latest production deployment to get the live URL
      const latestDeployment = await vercel.getLatestDeployment(vercelProject.id)
      
      // Build a list of potential URLs - only from Vercel's assigned domains
      const candidateUrls: string[] = []
      
      // Special cases: Connext Homes and Moood should use Vercel URL
      const shouldUseVercelUrl = vercelProject.name.toLowerCase().includes('connext') || 
                                vercelProject.name.toLowerCase().includes('connexthomes') ||
                                vercelProject.name.toLowerCase().includes('moood')
      
      // Get assigned domains from Vercel (custom domains)
      const assignedDomains: string[] = []
      
      // Collect domains from alias property
      if (vercelProject.alias && vercelProject.alias.length > 0) {
        vercelProject.alias.forEach(alias => {
          const domain = `https://${alias.domain}`
          if (!assignedDomains.includes(domain)) {
            assignedDomains.push(domain)
          }
        })
      }
      
      // Collect domains from production target
      if (vercelProject.targets?.production?.alias && vercelProject.targets.production.alias.length > 0) {
        vercelProject.targets.production.alias.forEach(domain => {
          const fullDomain = `https://${domain}`
          if (!assignedDomains.includes(fullDomain)) {
            assignedDomains.push(fullDomain)
          }
        })
      }
      
      // Get Vercel deployment URL
      let vercelDeploymentUrl: string | null = null
      if (latestDeployment?.url) {
        vercelDeploymentUrl = `https://${latestDeployment.url}`
        console.log(`📍 Deployment URL for ${vercelProject.name}: ${vercelDeploymentUrl}`)
      }
      
      // Check if project already exists
      let project = await prisma.project.findUnique({
        where: { vercelId: vercelProject.id }
      })
      
      // Determine if we should use Vercel domain
      const shouldUseVercelDomain = project?.useVercelDomain || shouldUseVercelUrl
      
      // Now build candidateUrls based on preference
      if (shouldUseVercelDomain) {
        // Use Vercel URL as priority
        if (vercelDeploymentUrl) {
          candidateUrls.push(vercelDeploymentUrl)
        }
        // Add custom domains as fallback
        candidateUrls.push(...assignedDomains)
      } else {
        // Custom domains get priority
        if (assignedDomains.length > 0) {
          // Use the first assigned domain (usually the main custom domain)
          candidateUrls.push(assignedDomains[0])
        } else if (vercelDeploymentUrl) {
          // Only use Vercel URL if no custom domains exist
          candidateUrls.push(vercelDeploymentUrl)
        }
      }
      
      console.log(`🔗 Available domains for ${vercelProject.name}:`, {
        assignedDomains,
        vercelUrl: vercelDeploymentUrl,
        useVercelDomain: shouldUseVercelDomain,
        selectedUrl: candidateUrls[0] || 'none'
      })
      
      // Use the first candidate URL (priority order)
      const liveUrl = candidateUrls[0] || null
      
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
            
            // Generate simple screenshot if URL is available
            if (liveUrl) {
              try {
                screenshotPath = await generateProjectScreenshot(liveUrl, vercelProject.name)
                if (screenshotPath) {
                  console.log(`✅ Generated screenshot for ${vercelProject.name}`)
                }
              } catch (error) {
                console.warn(`⚠️ Screenshot failed for ${vercelProject.name}:`, error)
              }
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
        
        const projectDetails = getProjectDetails(vercelProject.framework || null, enhancedInfo.primaryLanguage || null)
        
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
            useVercelDomain: shouldUseVercelUrl, // Set based on project name
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