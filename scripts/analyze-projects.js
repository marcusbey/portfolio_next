const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeProjects() {
  console.log('🔍 Current project analysis...\n');
  
  // Get all projects with screenshot status
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      imageUrl: true,
      lastScreenshotAt: true,
      isVisible: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log('📊 Project Summary:');
  console.log('Total projects:', projects.length);
  console.log('With screenshots:', projects.filter(p => p.imageUrl).length);
  console.log('Without screenshots:', projects.filter(p => !p.imageUrl).length);
  console.log('Visible projects:', projects.filter(p => p.isVisible).length);
  
  console.log('\n🔍 Projects needing attention:');
  
  const problemProjects = projects.filter(p => !p.imageUrl || p.name.includes('connex'));
  problemProjects.forEach(project => {
    console.log(`- ${project.name}: ${project.url || 'No URL'} | Screenshot: ${project.imageUrl ? 'Yes' : 'Missing'}`);
  });
  
  console.log('\n📋 All projects:');
  projects.forEach(project => {
    const status = project.imageUrl ? '✅' : '❌';
    console.log(`${status} ${project.name} | ${project.url || 'No URL'} | ${project.isVisible ? 'Visible' : 'Hidden'}`);
  });
  
  await prisma.$disconnect();
}

analyzeProjects().catch(console.error);