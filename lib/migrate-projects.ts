import { prisma } from './prisma'
import { projects } from '@/constants/projects'
import { stack } from '@/constants/stack'

export async function migrateExistingProjects() {
  console.log('🚀 Starting project migration...')
  
  try {
    // Clear existing projects
    await prisma.projectTechnology.deleteMany()
    await prisma.project.deleteMany()
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      
      console.log(`📦 Migrating project: ${project.title}`)
      
      // Create project
      const createdProject = await prisma.project.create({
        data: {
          name: project.title,
          description: project.description,
          url: project.link,
          imageUrl: project.image,
          isVisible: true, // Existing projects should be visible
          displayOrder: i,
        },
      })
      
      // Add technologies
      for (const stackItem of project.stack) {
        const stackInfo = Object.values(stack).find(s => s.id === stackItem.id)
        if (stackInfo) {
          await prisma.projectTechnology.create({
            data: {
              projectId: createdProject.id,
              technology: stackInfo.name,
            },
          })
        }
      }
    }
    
    console.log(`✅ Successfully migrated ${projects.length} projects`)
    return { success: true, count: projects.length }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}