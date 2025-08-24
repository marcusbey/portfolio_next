export interface VercelProject {
  id: string
  name: string
  framework?: string
  link?: {
    type: string
    repo: string
    repoId?: number
    gitSource?: string
  }
  alias?: {
    domain: string
  }[]
  targets?: {
    production?: {
      url: string
      alias?: string[]
    }
  }
  createdAt: number
  updatedAt: number
}

export interface GitHubRepo {
  full_name: string
  description: string | null
  html_url: string
  topics: string[]
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
}

export interface VercelDeployment {
  uid: string
  name: string
  url: string
  created: number
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED'
  type: 'LAMBDAS'
  target: 'production' | 'staging'
  projectId: string
  creator: {
    uid: string
    username: string
  }
  inspectorUrl?: string
  meta?: {
    githubCommitMessage?: string
    githubCommitSha?: string
    githubOrg?: string
    githubRepo?: string
    branchName?: string
  }
  previewUrl?: string
  screenshot?: string
}

export class VercelAPI {
  private baseURL = 'https://api.vercel.com'
  private githubAPI = 'https://api.github.com'
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProjects(): Promise<{ projects: VercelProject[] }> {
    return this.request('/v9/projects')
  }

  async getProject(idOrName: string): Promise<VercelProject> {
    return this.request(`/v9/projects/${idOrName}`)
  }

  async getDeployments(projectId?: string): Promise<{ deployments: VercelDeployment[] }> {
    const endpoint = projectId 
      ? `/v6/deployments?projectId=${projectId}&limit=10&target=production`
      : '/v6/deployments?limit=10&target=production'
    
    return this.request(endpoint)
  }

  async getLatestDeployment(projectId: string): Promise<VercelDeployment | null> {
    const { deployments } = await this.getDeployments(projectId)
    
    const productionDeployments = deployments.filter(d => 
      d.target === 'production' && d.state === 'READY'
    )
    
    return productionDeployments.length > 0 ? productionDeployments[0] : null
  }

  async getDeploymentScreenshot(deploymentId: string): Promise<string | null> {
    try {
      // Multiple screenshot URL patterns to try
      const screenshotUrls = [
        // Vercel's official screenshot API
        `https://api.vercel.com/v1/deployments/${deploymentId}/screenshot`,
        // Alternative screenshot service
        `https://vercel.com/api/screenshot/${deploymentId}`,
        // Deployment preview image
        `https://vercel.com/_next/image?url=https%3A%2F%2Fapi.vercel.com%2Fv1%2Fdeployments%2F${deploymentId}%2Fscreenshot&w=1200&q=75`,
      ]

      for (const url of screenshotUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'User-Agent': 'Vercel-Project-Sync/1.0'
            },
          })

          if (response.ok) {
            const contentType = response.headers.get('content-type')
            
            // If it's JSON, extract URL
            if (contentType?.includes('application/json')) {
              const data = await response.json()
              if (data.url) {
                console.log(`✅ Found screenshot URL via API: ${data.url}`)
                return data.url
              }
            }
            
            // If it's an image, return the direct URL
            if (contentType?.includes('image/')) {
              console.log(`✅ Found direct screenshot: ${url}`)
              return url
            }
          }
        } catch (error) {
          console.log(`❌ Screenshot URL failed: ${url}`)
          continue
        }
      }

      return null
    } catch (error) {
      console.error(`Failed to get screenshot for deployment ${deploymentId}:`, error)
      return null
    }
  }

  async getProjectPreviewImage(project: VercelProject): Promise<string | null> {
    try {
      console.log(`🔍 Attempting to get preview image for project: ${project.name}`)
      
      // Try to get the latest deployment's screenshot
      const latestDeployment = await this.getLatestDeployment(project.id)
      
      if (latestDeployment) {
        console.log(`📦 Found latest deployment: ${latestDeployment.uid}`)
        
        // Try multiple Vercel preview methods
        const previewMethods = [
          // Method 1: Vercel's deployment screenshot API
          async () => {
            const screenshot = await this.getDeploymentScreenshot(latestDeployment.uid)
            if (screenshot) {
              console.log(`✅ Got deployment screenshot: ${screenshot}`)
              return screenshot
            }
            return null
          },
          
          // Method 2: Project-level preview from Vercel dashboard
          async () => {
            const dashboardPreview = `https://vercel.com/_next/image?url=https%3A%2F%2Fapi.vercel.com%2Fv1%2Fprojects%2F${project.id}%2Fpreview&w=1200&q=75`
            
            try {
              const response = await fetch(dashboardPreview, {
                headers: { 'Authorization': `Bearer ${this.token}` },
                method: 'HEAD'
              })
              
              if (response.ok) {
                console.log(`✅ Got dashboard preview: ${dashboardPreview}`)
                return dashboardPreview
              }
            } catch {
              return null
            }
            return null
          },
          
          // Method 3: Social card / OG image from deployment
          async () => {
            const deploymentUrl = `https://${latestDeployment.url}`
            const ogUrls = [
              `${deploymentUrl}/api/og`,
              `${deploymentUrl}/og-image.png`,
              `${deploymentUrl}/api/og-image`,
              `${deploymentUrl}/social-preview.png`
            ]
            
            for (const ogUrl of ogUrls) {
              try {
                const response = await fetch(ogUrl, { method: 'HEAD' })
                if (response.ok && response.headers.get('content-type')?.includes('image/')) {
                  console.log(`✅ Got OG image: ${ogUrl}`)
                  return ogUrl
                }
              } catch {
                continue
              }
            }
            return null
          }
        ]
        
        // Try each method sequentially
        for (const method of previewMethods) {
          try {
            const result = await method()
            if (result) {
              return result
            }
          } catch (error) {
            console.log(`Preview method failed:`, error)
            continue
          }
        }
      }

      console.log(`⚠️ No preview image found for project: ${project.name}`)
      return null
    } catch (error) {
      console.error(`Failed to get preview image for project ${project.name}:`, error)
      return null
    }
  }

  // GitHub Integration Methods
  private async githubRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.githubAPI}${endpoint}`
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Vercel-Project-Sync/1.0'
    }

    // Add GitHub token if available
    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }
    
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.warn(`GitHub API warning: ${response.status} for ${endpoint}`)
      return null as T
    }

    return response.json()
  }

  async getGitHubRepoInfo(repoFullName: string): Promise<GitHubRepo | null> {
    try {
      return await this.githubRequest<GitHubRepo>(`/repos/${repoFullName}`)
    } catch (error) {
      console.error(`Failed to get GitHub repo info for ${repoFullName}:`, error)
      return null
    }
  }

  async getReadmeContent(repoFullName: string): Promise<string | null> {
    try {
      const readmeResponse = await this.githubRequest<{ content: string, encoding: string }>(`/repos/${repoFullName}/readme`)
      
      if (!readmeResponse || !readmeResponse.content) {
        return null
      }

      // Decode base64 content
      const content = Buffer.from(readmeResponse.content, 'base64').toString('utf-8')
      
      // Extract description from README
      return this.extractDescriptionFromReadme(content)
    } catch (error) {
      console.error(`Failed to get README for ${repoFullName}:`, error)
      return null
    }
  }

  private extractDescriptionFromReadme(content: string): string {
    // Remove markdown syntax and get meaningful description
    let description = content
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('!['))
      .slice(0, 3) // Take first 3 meaningful lines
      .join(' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove code blocks
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .trim()

    // Limit length and ensure it ends nicely
    if (description.length > 200) {
      description = description.substring(0, 197) + '...'
    }

    return description || 'Modern web application with clean architecture and responsive design.'
  }

  async getEnhancedProjectInfo(project: VercelProject): Promise<{
    description: string
    longDescription: string
    githubUrl?: string
    topics: string[]
    primaryLanguage?: string
  }> {
    let description = 'Modern web application built with cutting-edge technologies.'
    let longDescription = 'This project showcases modern development practices with clean architecture and responsive design.'
    let githubUrl: string | undefined
    let topics: string[] = []
    let primaryLanguage: string | undefined

    if (project.link?.repo) {
      try {
        const repoFullName = project.link.repo.replace('https://github.com/', '').replace('.git', '')
        
        // Get repo info and README in parallel
        const [repoInfo, readmeDescription] = await Promise.all([
          this.getGitHubRepoInfo(repoFullName),
          this.getReadmeContent(repoFullName)
        ])

        if (repoInfo) {
          githubUrl = repoInfo.html_url
          topics = repoInfo.topics || []
          primaryLanguage = repoInfo.language || undefined
          
          // Use GitHub description as fallback
          if (repoInfo.description) {
            description = repoInfo.description
          }
        }

        // Prefer README description if available
        if (readmeDescription) {
          description = readmeDescription
        }

        // Generate long description
        longDescription = this.generateLongDescription(project, repoInfo, readmeDescription)

      } catch (error) {
        console.error(`Failed to get enhanced info for ${project.name}:`, error)
      }
    }

    return {
      description,
      longDescription,
      githubUrl,
      topics,
      primaryLanguage
    }
  }

  private generateLongDescription(project: VercelProject, repoInfo: GitHubRepo | null, readmeDesc: string | null): string {
    const framework = project.framework || 'modern web technologies'
    const description = readmeDesc || repoInfo?.description || 'This project showcases modern development practices'
    
    return `${description}. Built with ${framework} and deployed on Vercel, this project demonstrates clean architecture, responsive design, and modern development practices. The application is optimized for performance and provides an excellent user experience across all devices.`
  }
}

export function createVercelClient(): VercelAPI {
  const token = process.env.VERCEL_API_TOKEN
  
  if (!token) {
    throw new Error('VERCEL_API_TOKEN environment variable is required')
  }
  
  return new VercelAPI(token)
}