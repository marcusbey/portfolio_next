import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // Simple auth check
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if tables exist by trying to count projects
    const projectCount = await prisma.project.count()
    
    res.status(200).json({
      success: true,
      message: 'Database is ready!',
      projectCount,
      databaseUrl: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
    })
  } catch (error) {
    console.error('Database setup error:', error)
    res.status(500).json({
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
}