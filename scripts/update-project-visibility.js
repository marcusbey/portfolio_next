const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProjectVisibility() {
  try {
    console.log('🔍 Checking project visibility status...\n');
    
    // Find the connex-website project
    const connexProject = await prisma.project.findFirst({
      where: {
        name: {
          contains: 'connex-website',
          mode: 'insensitive'
        }
      }
    });
    
    if (!connexProject) {
      console.error('❌ connex-website project not found');
      return;
    }
    
    console.log(`✅ Found connex-website project:`);
    console.log(`   - ID: ${connexProject.id}`);
    console.log(`   - Name: ${connexProject.name}`);
    console.log(`   - Current visibility: ${connexProject.isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    console.log(`   - URL: ${connexProject.url}`);
    console.log(`   - Tech Stack: ${connexProject.techStack.join(', ')}`);
    
    // Update visibility if hidden
    if (!connexProject.isVisible) {
      console.log('\n🔄 Updating connex-website to visible...');
      
      const updated = await prisma.project.update({
        where: { id: connexProject.id },
        data: { isVisible: true }
      });
      
      console.log('✅ Successfully updated connex-website visibility to: VISIBLE');
    } else {
      console.log('\n✅ connex-website is already visible');
    }
    
    // Check for other hidden projects
    console.log('\n🔍 Checking for other hidden projects...\n');
    
    const hiddenProjects = await prisma.project.findMany({
      where: { isVisible: false },
      select: {
        id: true,
        name: true,
        url: true,
        techStack: true,
        description: true,
        imageUrl: true
      }
    });
    
    if (hiddenProjects.length === 0) {
      console.log('✅ No hidden projects found');
    } else {
      console.log(`⚠️  Found ${hiddenProjects.length} hidden project(s):\n`);
      
      hiddenProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   - ID: ${project.id}`);
        console.log(`   - URL: ${project.url || 'No URL'}`);
        console.log(`   - Tech Stack: ${project.techStack.length > 0 ? project.techStack.join(', ') : 'No tech stack'}`);
        console.log(`   - Has Image: ${project.imageUrl ? 'Yes' : 'No'}`);
        console.log(`   - Description: ${project.description ? project.description.substring(0, 50) + '...' : 'No description'}`);
        console.log('');
      });
      
      // Offer to make all projects visible
      console.log('💡 To make all projects visible, run: npm run make-all-visible');
    }
    
    // Verify the update
    console.log('\n📊 Final visibility status:');
    
    const visibleCount = await prisma.project.count({
      where: { isVisible: true }
    });
    
    const totalCount = await prisma.project.count();
    
    console.log(`   - Visible projects: ${visibleCount}`);
    console.log(`   - Hidden projects: ${totalCount - visibleCount}`);
    console.log(`   - Total projects: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error updating project visibility:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProjectVisibility()
  .then(() => {
    console.log('\n🎉 Visibility update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });