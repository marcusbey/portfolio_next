import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Verify cron job authorization
      const authHeader = req.headers.authorization
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      // Call the sync endpoint internally
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!syncResponse.ok) {
        throw new Error(`Sync failed with status: ${syncResponse.status}`)
      }
      
      const syncResult = await syncResponse.json()
      
      res.status(200).json({
        message: 'Cron job executed successfully',
        timestamp: new Date().toISOString(),
        ...syncResult
      })
    } catch (error) {
      console.error('Cron job error:', error)
      res.status(500).json({ 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}