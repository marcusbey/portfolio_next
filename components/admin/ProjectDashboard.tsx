import { useState, useEffect } from 'react'
import { Project } from '@prisma/client'
import useSWR from 'swr'
import { EnhancedProjectTable } from './EnhancedProjectTable'
import { SyncStatus } from './SyncStatus'

interface ProjectWithTechnologies extends Project {
  technologies: Array<{ id: string; technology: string }>
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ProjectDashboard() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  
  const { data, error, mutate } = useSWR<{ projects: ProjectWithTechnologies[] }>(
    '/api/projects/admin',
    fetcher
  )

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncMessage('')
    
    try {
      const response = await fetch('/api/projects/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Sync failed')
      }
      
      const result = await response.json()
      setSyncMessage(`Successfully synced ${result.syncedCount} projects`)
      mutate() // Refresh the data
    } catch (error) {
      setSyncMessage('Sync failed. Please try again.')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleProjectUpdate = async (projectId: string, updates: { 
    isVisible?: boolean; 
    displayOrder?: number; 
    url?: string;
    description?: string;
    longDescription?: string;
    techStack?: string[];
    imageUrls?: string[];
  }) => {
    try {
      const response = await fetch('/api/projects/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          ...updates,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Update failed')
      }
      
      mutate() // Refresh the data
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const handleRegenerateScreenshot = async (projectId: string) => {
    try {
      setSyncMessage('Regenerating screenshot...')
      
      const response = await fetch('/api/projects/generate-screenshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectIds: [projectId],
          force: true,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Screenshot generation failed')
      }
      
      const result = await response.json()
      setSyncMessage(`Screenshot regenerated successfully!`)
      mutate() // Refresh the data
      
      // Clear message after 3 seconds
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (error) {
      setSyncMessage('Screenshot generation failed. Please try again.')
      console.error('Screenshot generation error:', error)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading projects</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load projects. Please check your connection and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Project Dashboard
        </h1>
        <p className="text-gray-600">
          Manage which projects are displayed on your website
        </p>
      </div>

      <SyncStatus 
        onSync={handleSync}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
      />

      {data?.projects ? (
        <EnhancedProjectTable 
          projects={data.projects}
          onProjectUpdate={handleProjectUpdate}
          onRegenerateScreenshot={handleRegenerateScreenshot}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}