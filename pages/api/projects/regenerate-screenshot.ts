import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getScreenshotGenerator } from '@/lib/screenshot';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for admin secret
  const authHeader = req.headers.authorization;
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  if (providedSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId, forceRegenerate = false } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    // Get the project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.url && !project.liveUrl) {
      return res.status(400).json({ error: 'Project has no URL to screenshot' });
    }

    // Use liveUrl if available, otherwise use url
    const urlToCapture = project.liveUrl || project.url;

    console.log(`📸 Regenerating screenshot for ${project.name}`);
    console.log(`   URL: ${urlToCapture}`);

    // Delete old screenshot if it exists and forceRegenerate is true
    if (forceRegenerate && project.imageUrl) {
      const oldImagePath = path.join(process.cwd(), 'public', project.imageUrl);
      if (existsSync(oldImagePath)) {
        unlinkSync(oldImagePath);
        console.log(`🗑️  Deleted old screenshot: ${project.imageUrl}`);
      }
    }

    // Generate new screenshot
    const generator = getScreenshotGenerator();
    const screenshotPath = await generator.generateScreenshot({
      url: urlToCapture!,
      projectName: project.name,
    });

    if (screenshotPath) {
      // Update project with new screenshot path
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          imageUrl: screenshotPath,
          lastScreenshotAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Screenshot generated successfully: ${screenshotPath}`);

      return res.status(200).json({
        success: true,
        message: 'Screenshot regenerated successfully',
        project: updatedProject,
        screenshotPath
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate screenshot',
        details: 'Screenshot generation returned null - check if the URL is accessible'
      });
    }
  } catch (error) {
    console.error('Error regenerating screenshot:', error);
    return res.status(500).json({
      error: 'Failed to regenerate screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}