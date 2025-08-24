// Manual URL fixes for projects that are working
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const WORKING_URLS = {
  'northscale': 'https://www.northscalegroup.com',
  'helloanna-landing': 'https://www.helloanna.app',
  'openflows-presentation': 'https://openflows-presentation.vercel.app',
  'connext-app': 'https://www.connexthomes.ca',
  // Add more as you identify working URLs
}

async function fixUrls() {
  try {
    console.log('🔧 Fixing project URLs with known working URLs...')
    
    for (const [projectName, workingUrl] of Object.entries(WORKING_URLS)) {
      try {
        const project = await prisma.project.findFirst({
          where: {
            name: {
              contains: projectName,
              mode: 'insensitive'
            }
          }
        })
        
        if (project) {
          await prisma.project.update({
            where: { id: project.id },
            data: { url: workingUrl }
          })
          console.log(`✅ Updated ${project.name}: ${workingUrl}`)
        } else {
          console.log(`⚠️ Project not found: ${projectName}`)
        }
      } catch (error) {
        console.error(`❌ Error updating ${projectName}:`, error.message)
      }
    }
    
    console.log('🎉 URL fixes complete!')
  } catch (error) {
    console.error('❌ Error fixing URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUrls()