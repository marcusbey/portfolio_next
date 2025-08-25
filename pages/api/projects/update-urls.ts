import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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

  const { projectId, url, liveUrl } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(url && { url }),
        ...(liveUrl && { liveUrl }),
        updatedAt: new Date()
      }
    });

    return res.status(200).json({ 
      success: true, 
      project: updatedProject 
    });
  } catch (error) {
    console.error('Error updating project URLs:', error);
    return res.status(500).json({ error: 'Failed to update project URLs' });
  } finally {
    await prisma.$disconnect();
  }
}