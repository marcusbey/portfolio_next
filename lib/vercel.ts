export interface VercelProject {
  id: string
  name: string
  framework?: string
  link?: {
    type: string
    repo: string
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
}

export class VercelAPI {
  private baseURL = 'https://api.vercel.com'
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
}

export function createVercelClient(): VercelAPI {
  const token = process.env.VERCEL_API_TOKEN
  
  if (!token) {
    throw new Error('VERCEL_API_TOKEN environment variable is required')
  }
  
  return new VercelAPI(token)
}