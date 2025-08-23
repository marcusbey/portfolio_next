const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Based on the working URLs from your logs and the good screenshots you showed
const WORKING_PROJECTS = {
  'northscale': 'https://www.northscalegroup.com',
  'helloanna-landing': 'https://www.helloanna.app', 
  'openflows-presentation': 'https://openflows-presentation.vercel.app',
  'connext-app': 'https://www.connexthomes.ca',
  'quizsmart': 'https://quizsmart-base-32.vercel.app',
  'nownownowio': 'https://nownownow.io',
  'compozit': 'https://compoz.it',
  'base32-tech': 'https://base32.tech',
  'remotejungle-ai': 'https://remotejungle.ai',
  'moood-ai': 'https://moood-ai.vercel.app',
}

async function fixUrlsSimple() {
  try {
    console.log('🔧 Setting working URLs for projects (simple version)...')
    
    for (const [projectKey, workingUrl] of Object.entries(WORKING_PROJECTS)) {
      try {
        // Find project by name (case insensitive partial match)
        // Only select basic fields to avoid schema issues
        const project = await prisma.project.findFirst({
          where: {
            name: {
              contains: projectKey,
              mode: 'insensitive'
            }
          },
          select: {
            id: true,
            name: true,
            url: true
          }
        })
        
        if (project) {
          // Update only the URL field (basic field that definitely exists)
          await prisma.project.update({
            where: { id: project.id },
            data: { 
              url: workingUrl
            }
          })
          console.log(`✅ Updated ${project.name}: ${workingUrl}`)
        } else {
          console.log(`⚠️ Project not found for key: ${projectKey}`)
        }
      } catch (error) {
        console.error(`❌ Error updating ${projectKey}:`, error.message)
      }
    }
    
    console.log('\n🎉 URL fixes complete!')
    console.log('💡 Next: Run screenshot generation from admin panel')
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUrlsSimple()