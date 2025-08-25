const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAllProjectsVisible() {
  try {
    console.log('🔄 Making all projects visible...\n');
    
    // Update all hidden projects
    const result = await prisma.project.updateMany({
      where: { isVisible: false },
      data: { isVisible: true }
    });
    
    console.log(`✅ Updated ${result.count} project(s) to visible`);
    
    // Show final status
    const allProjects = await prisma.project.findMany({
      select: {
        name: true,
        isVisible: true,
        url: true,
        techStack: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('\n📊 All projects status:');
    allProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}: ${project.isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    });
    
  } catch (error) {
    console.error('❌ Error making projects visible:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
makeAllProjectsVisible()
  .then(() => {
    console.log('\n🎉 All projects are now visible');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });