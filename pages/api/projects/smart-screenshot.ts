import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProjectScreenshot } from '@/lib/screenshot'

// Smart URL patterns to try
function generateURLCandidates(projectName: string): string[] {
  const name = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  return [
    // Common domain patterns
    `https://${name}.com`,
    `https://www.${name}.com`,
    `https://${name}.app`,
    `https://${name}.io`,
    `https://${name}.dev`,
    
    // Vercel patterns
    `https://${name}.vercel.app`,
    `https://${projectName}.vercel.app`,
    
    // Netlify patterns
    `https://${name}.netlify.app`,
    
    // GitHub Pages
    `https://${name}.github.io`,
    
    // Alternative patterns
    `https://${name}.tech`,
    `https://${name}.site`,
    `https://app.${name}.com`,
    `https://demo.${name}.com`,
  ]
}

// Test if a URL is accessible and not a login page
async function testURL(url: string): Promise<{ accessible: boolean; isLogin: boolean; score: number }> {
  try {
    // Add Vercel bypass if needed
    let testUrl = url
    if (process.env.VERCEL_BYPASS_SECRET && (url.includes('.vercel.app') || url.includes('vercel.com'))) {
      const separator = url.includes('?') ? '&' : '?'
      testUrl = `${url}${separator}_vercel_share=${process.env.VERCEL_BYPASS_SECRET}`
    }
    
    const response = await fetch(testUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScreenshotBot/1.0)'
      },
      redirect: 'follow'
    })
    
    if (!response.ok) {
      return { accessible: false, isLogin: false, score: 0 }
    }

    // Check if redirected to login
    const finalUrl = response.url
    const isLogin = finalUrl.includes('/login') || 
                   finalUrl.includes('/auth') || 
                   finalUrl.includes('vercel.com/login')
    
    const score = response.ok && !isLogin ? 100 : 0
    
    return { 
      accessible: response.ok, 
      isLogin, 
      score 
    }
  } catch {
    return { accessible: false, isLogin: false, score: 0 }
  }
}

// Find the best URL from candidates
async function findBestURL(candidates: string[]): Promise<string | null> {
  console.log(`🔍 Testing ${candidates.length} URL candidates`)
  
  const results = await Promise.all(
    candidates.map(async url => ({
      url,
      ...(await testURL(url))
    }))
  )
  
  // Sort by score (highest first)
  const validUrls = results
    .filter(r => r.accessible && !r.isLogin)
    .sort((a, b) => b.score - a.score)
  
  if (validUrls.length > 0) {
    console.log(`✅ Found working URL: ${validUrls[0].url}`)
    return validUrls[0].url
  }
  
  console.log(`⚠️ No accessible URLs found from ${candidates.length} candidates`)
  return null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { projectId } = req.body
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' })
    }
    
    // Get project from database
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    console.log(`🔄 Smart screenshot generation for: ${project.name}`)
    
    // Generate URL candidates
    const candidates = generateURLCandidates(project.name)
    
    // If project already has a URL, test it first
    if (project.url) {
      candidates.unshift(project.url)
    }
    
    // Find best URL
    const bestUrl = await findBestURL(candidates)
    
    if (!bestUrl) {
      return res.status(404).json({ 
        error: 'No accessible URL found for project',
        testedUrls: candidates.slice(0, 5) // Return first 5 for debugging
      })
    }
    
    // Update project URL if it's different
    if (bestUrl !== project.url) {
      await prisma.project.update({
        where: { id: projectId },
        data: { url: bestUrl }
      })
      console.log(`📍 Updated project URL: ${bestUrl}`)
    }
    
    // Generate screenshot
    const screenshotPath = await generateProjectScreenshot(bestUrl, project.name)
    
    if (screenshotPath) {
      // Update project with new screenshot
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { imageUrl: screenshotPath }
      })
      
      res.status(200).json({
        success: true,
        message: 'Smart screenshot generated successfully',
        project: updatedProject,
        usedUrl: bestUrl,
        screenshotPath
      })
    } else {
      res.status(500).json({
        error: 'Failed to generate screenshot',
        message: 'Screenshot generation failed despite finding accessible URL',
        usedUrl: bestUrl
      })
    }
    
  } catch (error) {
    console.error('Smart screenshot error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}