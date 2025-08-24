import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingProjects() {
  console.log('🔄 Starting migration of existing projects...')
  
  try {
    // Update all existing projects to be visible
    const updateResult = await prisma.project.updateMany({
      where: {
        isVisible: false, // Only update projects that are currently not visible
      },
      data: {
        isVisible: true,
        status: 'completed',
        projectType: 'Web App', // Default type, can be updated later
        category: 'fullstack', // Default category
      }
    })

    console.log(`✅ Updated ${updateResult.count} existing projects to be visible`)

    // Get all projects and show current status
    const allProjects = await prisma.project.findMany({
      include: {
        technologies: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    console.log('\n📊 Current projects status:')
    allProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`)
      console.log(`   - Visible: ${project.isVisible ? '✅' : '❌'}`)
      console.log(`   - Type: ${project.projectType || 'Not set'}`)
      console.log(`   - Category: ${project.category || 'Not set'}`)
      console.log(`   - Technologies: ${project.technologies.map(t => t.technology).join(', ')}`)
      console.log(`   - Created: ${project.createdAt.toDateString()}`)
      console.log('   ---')
    })

    console.log(`\n🎉 Migration completed! Total projects: ${allProjects.length}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateExistingProjects()
  .catch((error) => {
    console.error('Migration script error:', error)
    process.exit(1)
  })