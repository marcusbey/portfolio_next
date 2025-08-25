const { PrismaClient } = require('@prisma/client');

// Import the compiled screenshot generator
const { generateProjectScreenshot } = require('../dist/screenshot');

const prisma = new PrismaClient();

async function fixConnexWebsiteScreenshot() {
  try {
    console.log('🔍 Finding connex-website project...');
    
    // Find the connex-website project
    const project = await prisma.project.findFirst({
      where: {
        name: {
          contains: 'connex-website',
          mode: 'insensitive'
        }
      }
    });
    
    if (!project) {
      console.error('❌ connex-website project not found');
      return;
    }
    
    console.log(`✅ Found project: ${project.name}`);
    console.log(`📍 Current URL: ${project.url}`);
    console.log(`🖼️ Current screenshot: ${project.imageUrl}`);
    
    if (!project.url) {
      console.error('❌ Project has no URL');
      return;
    }
    
    // Generate a new screenshot
    console.log('📸 Generating new screenshot...');
    
    const screenshotPath = await generateProjectScreenshot(project.url, project.name);
    
    if (screenshotPath) {
      // Update the project with the new screenshot
      await prisma.project.update({
        where: { id: project.id },
        data: { 
          imageUrl: screenshotPath,
          lastScreenshotAt: new Date()
        }
      });
      
      console.log(`✅ Successfully generated new screenshot: ${screenshotPath}`);
    } else {
      console.error('❌ Failed to generate screenshot');
      
      // Let's try to find alternative URLs for this project
      console.log('🔍 Attempting to find alternative URLs...');
      
      // Basic URL variations
      const projectName = project.name.toLowerCase().replace(/-/g, '');
      const alternativeUrls = [
        `https://${projectName}.vercel.app`,
        `https://${project.name}.vercel.app`,
        `https://${project.name}.netlify.app`,
        project.url?.replace('p0rk7z4c3-base-32', 'romainboboe'),
        project.url?.replace('p0rk7z4c3-base-32', 'base32'),
        project.url?.replace('-p0rk7z4c3-base-32', ''),
      ].filter(Boolean);
      
      console.log('🔄 Trying alternative URLs:', alternativeUrls);
      
      for (const altUrl of alternativeUrls) {
        console.log(`🌐 Testing: ${altUrl}`);
        
        try {
          const altScreenshot = await generateProjectScreenshot(altUrl, project.name);
          if (altScreenshot) {
            // Update both URL and screenshot
            await prisma.project.update({
              where: { id: project.id },
              data: { 
                url: altUrl,
                imageUrl: altScreenshot,
                lastScreenshotAt: new Date()
              }
            });
            
            console.log(`✅ Success with alternative URL: ${altUrl}`);
            console.log(`🖼️ New screenshot: ${altScreenshot}`);
            return;
          }
        } catch (error) {
          console.log(`❌ Failed with ${altUrl}:`, error.message);
        }
      }
      
      console.error('❌ All alternative URLs failed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing connex-website screenshot:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixConnexWebsiteScreenshot()
  .then(() => {
    console.log('🎉 Fix attempt complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });