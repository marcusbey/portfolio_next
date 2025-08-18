import { ArrowPathIcon, CameraIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface SyncStatusProps {
  onSync: () => void
  isSyncing: boolean
  syncMessage: string
}

export function SyncStatus({ onSync, isSyncing, syncMessage }: SyncStatusProps) {
  const [isGeneratingScreenshots, setIsGeneratingScreenshots] = useState(false)
  const [screenshotMessage, setScreenshotMessage] = useState('')

  const handleGenerateScreenshots = async () => {
    setIsGeneratingScreenshots(true)
    setScreenshotMessage('')
    
    try {
      const response = await fetch('/api/projects/generate-screenshots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Screenshot generation failed')
      }
      
      const result = await response.json()
      setScreenshotMessage(result.message)
    } catch (error) {
      setScreenshotMessage('Screenshot generation failed. Please try again.')
      console.error('Screenshot generation error:', error)
    } finally {
      setIsGeneratingScreenshots(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Project Management
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Synchronize projects from Vercel and generate preview images
          </p>
          
          <div className="space-y-2">
            {syncMessage && (
              <p className={`text-sm ${
                syncMessage.includes('failed') || syncMessage.includes('error')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                📡 {syncMessage}
              </p>
            )}
            
            {screenshotMessage && (
              <p className={`text-sm ${
                screenshotMessage.includes('failed') || screenshotMessage.includes('error')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                📸 {screenshotMessage}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isSyncing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <ArrowPathIcon 
              className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} 
            />
            {isSyncing ? 'Syncing...' : 'Sync Projects'}
          </button>
          
          <button
            onClick={handleGenerateScreenshots}
            disabled={isGeneratingScreenshots}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isGeneratingScreenshots
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            <CameraIcon 
              className={`h-4 w-4 mr-2 ${isGeneratingScreenshots ? 'animate-pulse' : ''}`} 
            />
            {isGeneratingScreenshots ? 'Generating...' : 'Generate Images'}
          </button>
        </div>
      </div>
    </div>
  )
}