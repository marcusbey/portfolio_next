const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Based on the working URLs from your logs and the good screenshots you showed
const WORKING_PROJECTS = {
  // From logs - these were found as accessible
  'northscale': 'https://www.northscalegroup.com',
  'helloanna-landing': 'https://www.helloanna.app', 
  'openflows-presentation': 'https://openflows-presentation.vercel.app',
  'connext-app': 'https://www.connexthomes.ca',
  'quizsmart': 'https://quizsmart-base-32.vercel.app', // This was found accessible
  
  // Based on your screenshot showing these as working
  'nownownowio': 'https://nownownow.io', // Try the actual domain
  'compozit': 'https://compoz.it', // Try the short domain
  
  // These might need manual verification
  'base32-tech': 'https://base32.tech',
  'remotejungle-ai': 'https://remotejungle.ai',
  'moood-ai': 'https://moood-ai.vercel.app',
}

async function fixWorkingUrls() {
  try {
    console.log('🔧 Setting working URLs for projects with good screenshots...')
    
    for (const [projectKey, workingUrl] of Object.entries(WORKING_PROJECTS)) {
      try {
        // Find project by name (case insensitive partial match)
        const project = await prisma.project.findFirst({
          where: {
            name: {
              contains: projectKey,
              mode: 'insensitive'
            }
          }
        })
        
        if (project) {
          // Update with working URL
          await prisma.project.update({
            where: { id: project.id },
            data: { 
              url: workingUrl,
              // Clear old screenshots to force regeneration
              imageUrl: null 
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
    
    console.log('\n🎉 URL fixes complete! Now run screenshot regeneration.')
    console.log('💡 Next step: Go to admin panel and click "Generate Screenshots"')
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixWorkingUrls()