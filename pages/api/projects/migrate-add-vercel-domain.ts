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
    // Check if the column already exists
    const columnExists = await checkColumnExists()
    
    if (columnExists) {
      return res.status(200).json({
        message: 'Column use_vercel_domain already exists',
        alreadyExists: true
      })
    }
    
    // Add the column
    await addUseVercelDomainColumn()
    
    // Update existing projects based on their names
    const updatedProjects = await updateExistingProjects()
    
    res.status(200).json({
      message: 'Column use_vercel_domain added successfully',
      updatedProjects,
      alreadyExists: false
    })
  } catch (error) {
    console.error('Migration error:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function checkColumnExists(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT use_vercel_domain FROM projects LIMIT 1`
    return true
  } catch (error) {
    return false
  }
}

async function addUseVercelDomainColumn(): Promise<void> {
  // Try PostgreSQL syntax first, then SQLite if that fails
  try {
    // PostgreSQL syntax
    await prisma.$executeRaw`ALTER TABLE projects ADD COLUMN use_vercel_domain BOOLEAN NOT NULL DEFAULT false`
  } catch (error) {
    try {
      // SQLite syntax
      await prisma.$executeRaw`ALTER TABLE projects ADD COLUMN use_vercel_domain INTEGER NOT NULL DEFAULT 0`
    } catch (sqliteError) {
      throw new Error(`Failed to add column with both PostgreSQL and SQLite syntax: ${error}`)
    }
  }
}

async function updateExistingProjects(): Promise<number> {
  // Update projects that should use Vercel domains
  const projectsToUpdate = await prisma.project.findMany({
    where: {
      OR: [
        { name: { contains: 'connext', mode: 'insensitive' } },
        { name: { contains: 'connexthomes', mode: 'insensitive' } },
        { name: { contains: 'moood', mode: 'insensitive' } }
      ]
    }
  })
  
  let updatedCount = 0
  
  for (const project of projectsToUpdate) {
    try {
      await prisma.project.update({
        where: { id: project.id },
        data: { useVercelDomain: true }
      })
      updatedCount++
    } catch (error) {
      console.error(`Failed to update project ${project.name}:`, error)
    }
  }
  
  return updatedCount
}