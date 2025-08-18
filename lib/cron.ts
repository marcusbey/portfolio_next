import cron from 'node-cron'

export function setupCronJobs() {
  // Sync Vercel projects every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running scheduled Vercel project sync...')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/sync-vercel-projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Cron job completed:', result)
      } else {
        console.error('❌ Cron job failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Cron job error:', error)
    }
  }, {
    timezone: "UTC"
  })
  
  console.log('📅 Cron jobs scheduled successfully')
}

export function runManualSync() {
  return fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
      'Content-Type': 'application/json',
    },
  })
}