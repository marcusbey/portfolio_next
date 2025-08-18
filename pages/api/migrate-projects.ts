import type { NextApiRequest, NextApiResponse } from 'next'
import { migrateExistingProjects } from '@/lib/migrate-projects'

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
    const result = await migrateExistingProjects()
    res.status(200).json({
      message: 'Projects migrated successfully',
      ...result
    })
  } catch (error) {
    console.error('Migration error:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}