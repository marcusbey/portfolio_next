import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  let browser;
  try {
    // Get the project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const urlToCapture = project.liveUrl || project.url || `https://${project.name}.vercel.app`;

    console.log(`📸 Force generating screenshot for ${project.name}`);
    console.log(`   URL: ${urlToCapture}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 630 });
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to URL
    const response = await page.goto(urlToCapture, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log(`   Response status: ${response?.status()}`);
    console.log(`   Page title: ${await page.title()}`);

    // Wait a bit for any animations
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 85,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 630 }
    });

    await page.close();
    await browser.close();
    browser = null;

    // Ensure screenshots directory exists
    const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'projects', 'generated');
    if (!existsSync(screenshotsDir)) {
      mkdirSync(screenshotsDir, { recursive: true });
    }

    // Generate filename
    const sanitizedName = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${sanitizedName}-${Date.now()}.jpg`;
    const filePath = path.join(screenshotsDir, filename);
    
    // Save screenshot
    writeFileSync(filePath, screenshot);
    
    const publicPath = `/images/projects/generated/${filename}`;

    // Update project with new screenshot
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        imageUrl: publicPath,
        lastScreenshotAt: new Date(),
      }
    });

    console.log(`✅ Screenshot saved: ${publicPath}`);

    return res.status(200).json({
      success: true,
      message: 'Screenshot generated successfully',
      project: updatedProject,
      screenshotPath: publicPath
    });

  } catch (error) {
    console.error('Force screenshot error:', error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({
      error: 'Failed to generate screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}