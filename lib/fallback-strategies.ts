import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import path from 'path'

export interface FallbackImage {
  type: 'github_readme' | 'project_logo' | 'generated_placeholder' | 'cached_screenshot' | 'default_template'
  url: string
  source: string
  confidence: number
  metadata?: any
}

export interface PlaceholderOptions {
  projectName: string
  description?: string
  technologies?: string[]
  framework?: string
  category?: string
  backgroundColor?: string
  textColor?: string
  width?: number
  height?: number
}

export interface FallbackResult {
  success: boolean
  imagePath?: string
  fallbackType: FallbackImage['type']
  error?: string
}

export class FallbackStrategiesService {
  private readonly assetsDir: string
  private readonly placeholdersDir: string
  private readonly cacheDir: string

  constructor() {
    this.assetsDir = path.join(process.cwd(), 'public', 'images', 'projects')
    this.placeholdersDir = path.join(this.assetsDir, 'placeholders')
    this.cacheDir = path.join(this.assetsDir, 'cache')
    this.ensureDirectories()
  }

  private ensureDirectories() {
    [this.assetsDir, this.placeholdersDir, this.cacheDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * Extract images from GitHub README
   */
  async extractGitHubReadmeImages(githubUrl: string): Promise<FallbackImage[]> {
    const images: FallbackImage[] = []
    
    try {
      if (!githubUrl) return images

      const repoMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (!repoMatch) return images

      const [, owner, repo] = repoMatch
      const repoName = repo.replace('.git', '')

      // Get README content
      const readmeUrl = `https://api.github.com/repos/${owner}/${repoName}/readme`
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Fallback-Image-Service/1.0'
      }

      const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`
      }

      const response = await fetch(readmeUrl, { headers })
      if (!response.ok) return images

      const readmeData = await response.json()
      const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')

      // Extract image URLs from markdown
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
      const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
      
      let match
      const extractedUrls = new Set<string>()

      // Markdown images
      while ((match = imageRegex.exec(content)) !== null) {
        const [, alt, url] = match
        if (this.isValidImageUrl(url)) {
          extractedUrls.add(this.resolveGitHubImageUrl(url, owner, repoName))
        }
      }

      // HTML images
      while ((match = htmlImageRegex.exec(content)) !== null) {
        const url = match[1]
        if (this.isValidImageUrl(url)) {
          extractedUrls.add(this.resolveGitHubImageUrl(url, owner, repoName))
        }
      }

      // Convert to FallbackImage objects with confidence scoring
      extractedUrls.forEach(url => {
        const confidence = this.calculateImageConfidence(url)
        if (confidence > 30) { // Only include likely good images
          images.push({
            type: 'github_readme',
            url,
            source: `GitHub README: ${owner}/${repoName}`,
            confidence
          })
        }
      })

      // Sort by confidence
      images.sort((a, b) => b.confidence - a.confidence)

    } catch (error) {
      console.error('Failed to extract GitHub README images:', error)
    }

    return images
  }

  /**
   * Resolve relative GitHub URLs to absolute URLs
   */
  private resolveGitHubImageUrl(url: string, owner: string, repo: string): string {
    if (url.startsWith('http')) {
      return url
    }
    
    if (url.startsWith('./') || url.startsWith('../') || !url.startsWith('/')) {
      // Relative path
      const cleanUrl = url.replace(/^\.\//, '').replace(/^\.\.\//, '')
      return `https://raw.githubusercontent.com/${owner}/${repo}/main/${cleanUrl}`
    }
    
    if (url.startsWith('/')) {
      // Absolute path from repo root
      return `https://raw.githubusercontent.com/${owner}/${repo}/main${url}`
    }
    
    return url
  }

  /**
   * Check if URL points to a valid image
   */
  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
    const lowerUrl = url.toLowerCase()
    
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('image') ||
           lowerUrl.includes('screenshot') ||
           lowerUrl.includes('preview')
  }

  /**
   * Calculate confidence score for an image URL
   */
  private calculateImageConfidence(url: string): number {
    let confidence = 50 // Base score
    
    const lowerUrl = url.toLowerCase()
    
    // High value indicators
    if (lowerUrl.includes('screenshot')) confidence += 30
    if (lowerUrl.includes('preview')) confidence += 25
    if (lowerUrl.includes('demo')) confidence += 25
    if (lowerUrl.includes('banner')) confidence += 20
    if (lowerUrl.includes('hero')) confidence += 20
    if (lowerUrl.includes('landing')) confidence += 15
    
    // Medium value indicators
    if (lowerUrl.includes('app')) confidence += 10
    if (lowerUrl.includes('web')) confidence += 10
    if (lowerUrl.includes('ui')) confidence += 10
    
    // File format bonuses
    if (lowerUrl.includes('.png')) confidence += 10
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) confidence += 5
    
    // Penalties
    if (lowerUrl.includes('logo')) confidence -= 10
    if (lowerUrl.includes('icon')) confidence -= 15
    if (lowerUrl.includes('avatar')) confidence -= 20
    if (lowerUrl.includes('badge')) confidence -= 25
    
    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Generate attractive placeholder image using SVG
   */
  async generatePlaceholder(options: PlaceholderOptions): Promise<FallbackResult> {
    try {
      const {
        projectName,
        description = 'Modern web application',
        technologies = [],
        framework,
        category,
        backgroundColor = '#1a1a1a',
        textColor = '#ffffff',
        width = 1200,
        height = 630
      } = options

      // Generate SVG placeholder
      const svg = this.generateSVGPlaceholder({
        projectName,
        description,
        technologies: technologies.slice(0, 5),
        framework,
        category,
        backgroundColor,
        textColor,
        width,
        height
      })

      // Save SVG placeholder
      const filename = `placeholder-${this.sanitizeFilename(projectName)}-${Date.now()}.svg`
      const filePath = path.join(this.placeholdersDir, filename)
      
      writeFileSync(filePath, svg, 'utf8')

      return {
        success: true,
        imagePath: `/images/projects/placeholders/${filename}`,
        fallbackType: 'generated_placeholder'
      }

    } catch (error) {
      console.error('Failed to generate placeholder:', error)
      return {
        success: false,
        fallbackType: 'generated_placeholder',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Generate SVG placeholder image
   */
  private generateSVGPlaceholder(options: {
    projectName: string
    description: string
    technologies: string[]
    framework?: string
    category?: string
    backgroundColor: string
    textColor: string
    width: number
    height: number
  }): string {
    const {
      projectName,
      description,
      technologies,
      framework,
      category,
      backgroundColor,
      textColor,
      width,
      height
    } = options

    const gradientColor = this.adjustColor(backgroundColor, -20)
    const categoryColor = category ? this.getCategoryColor(category) : textColor

    // Split long project names
    const nameLines = this.splitText(projectName, 20)
    const descLines = this.splitText(description, 50)

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradientColor};stop-opacity:1" />
        </linearGradient>
        
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#backgroundGradient)"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <!-- Category Badge -->
      ${category ? `
        <rect x="40" y="20" width="${category.length * 12 + 20}" height="30" fill="${categoryColor}" rx="15"/>
        <text x="50" y="40" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">
          ${category.toUpperCase()}
        </text>
      ` : ''}
      
      <!-- Project Name -->
      <g transform="translate(${width / 2}, ${height * 0.3})">
        ${nameLines.map((line, index) => `
          <text x="0" y="${index * 60}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
                fill="${textColor}" text-anchor="middle">
            ${this.escapeXml(line)}
          </text>
        `).join('')}
      </g>
      
      <!-- Description -->
      <g transform="translate(${width / 2}, ${height * 0.3 + 120})">
        ${descLines.slice(0, 2).map((line, index) => `
          <text x="0" y="${index * 35}" font-family="Arial, sans-serif" font-size="24" 
                fill="${this.adjustColor(textColor, -30)}" text-anchor="middle">
            ${this.escapeXml(line)}
          </text>
        `).join('')}
      </g>
      
      <!-- Technology Badges -->
      ${technologies.length > 0 ? this.generateTechnologyBadgesSVG(technologies, width, height - 100) : ''}
      
      <!-- Framework -->
      ${framework ? `
        <text x="${width / 2}" y="${height - 40}" font-family="Arial, sans-serif" font-size="18" 
              fill="${this.adjustColor(textColor, -40)}" text-anchor="middle">
          Built with ${this.escapeXml(framework)}
        </text>
      ` : ''}
      
    </svg>`

    return svg
  }

  /**
   * Generate technology badges as SVG
   */
  private generateTechnologyBadgesSVG(technologies: string[], centerX: number, y: number): string {
    const badgeHeight = 30
    const badgePadding = 15
    const badgeSpacing = 10
    
    // Calculate total width
    const totalWidth = technologies.reduce((acc, tech, index) => {
      const textWidth = tech.length * 8 // Approximate character width
      return acc + textWidth + (badgePadding * 2) + (index > 0 ? badgeSpacing : 0)
    }, 0)
    
    let currentX = centerX - (totalWidth / 2)
    
    return technologies.map(tech => {
      const textWidth = tech.length * 8
      const badgeWidth = textWidth + (badgePadding * 2)
      const color = this.getTechnologyColor(tech)
      
      const badge = `
        <rect x="${currentX}" y="${y - badgeHeight / 2}" width="${badgeWidth}" height="${badgeHeight}" 
              fill="${color}" rx="15"/>
        <text x="${currentX + badgeWidth / 2}" y="${y + 4}" font-family="Arial, sans-serif" font-size="12" 
              font-weight="bold" fill="white" text-anchor="middle">
          ${this.escapeXml(tech)}
        </text>
      `
      
      currentX += badgeWidth + badgeSpacing
      return badge
    }).join('')
  }

  /**
   * Split text into lines of maximum length
   */
  private splitText(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text]
    
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (testLine.length > maxLength && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  /**
   * Escape XML characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }


  /**
   * Get color for technology badge
   */
  private getTechnologyColor(tech: string): string {
    const colors: Record<string, string> = {
      'react': '#61dafb',
      'vue': '#4fc08d',
      'angular': '#dd0031',
      'svelte': '#ff3e00',
      'next.js': '#000000',
      'nuxt.js': '#00c58e',
      'typescript': '#3178c6',
      'javascript': '#f7df1e',
      'node.js': '#339933',
      'python': '#3776ab',
      'java': '#ed8b00',
      'go': '#00add8',
      'rust': '#000000',
      'php': '#777bb4'
    }
    
    const lowerTech = tech.toLowerCase()
    return colors[lowerTech] || '#6b7280'
  }

  /**
   * Get color for project category
   */
  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'frontend': '#3b82f6',
      'backend': '#059669',
      'fullstack': '#7c3aed',
      'mobile': '#f59e0b',
      'ai': '#ec4899',
      'devtools': '#6b7280',
      'library': '#8b5cf6'
    }
    
    return colors[category.toLowerCase()] || '#6b7280'
  }


  /**
   * Adjust color brightness
   */
  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  /**
   * Check for cached screenshot
   */
  async getCachedScreenshot(projectName: string): Promise<FallbackResult | null> {
    try {
      const sanitizedName = this.sanitizeFilename(projectName)
      const cachePattern = new RegExp(`${sanitizedName}-\\d+\\.(jpg|png|jpeg)`)
      
      // This would need to be implemented with a proper file system search
      // For now, return null as we don't have a caching system
      return null
      
    } catch (error) {
      console.error('Failed to check cached screenshot:', error)
      return null
    }
  }

  /**
   * Create default template based on project type
   */
  async createDefaultTemplate(projectName: string, framework?: string): Promise<FallbackResult> {
    const templates = {
      'react': { bg: '#1a1a1a', accent: '#61dafb' },
      'vue': { bg: '#2c3e50', accent: '#4fc08d' },
      'angular': { bg: '#1e1e1e', accent: '#dd0031' },
      'svelte': { bg: '#ff3e00', accent: '#ffffff' },
      'next.js': { bg: '#000000', accent: '#ffffff' },
      'default': { bg: '#1a1a2e', accent: '#16213e' }
    }
    
    const template = templates[framework?.toLowerCase() as keyof typeof templates] || templates.default
    
    return this.generatePlaceholder({
      projectName,
      description: `${framework ? `${framework} ` : ''}application`,
      backgroundColor: template.bg,
      textColor: template.accent,
      framework
    })
  }

  /**
   * Get best fallback image using all strategies
   */
  async getBestFallback(
    projectName: string,
    githubUrl?: string,
    framework?: string,
    technologies?: string[]
  ): Promise<FallbackResult> {
    console.log(`🔄 Getting fallback image for ${projectName}`)
    
    // Strategy 1: GitHub README images
    if (githubUrl) {
      const readmeImages = await this.extractGitHubReadmeImages(githubUrl)
      if (readmeImages.length > 0) {
        console.log(`✅ Found ${readmeImages.length} GitHub README images`)
        // For now, just reference the URL - in production you might want to download and cache
        return {
          success: true,
          imagePath: readmeImages[0].url,
          fallbackType: 'github_readme'
        }
      }
    }

    // Strategy 2: Check cached screenshots
    const cached = await this.getCachedScreenshot(projectName)
    if (cached) {
      console.log(`✅ Found cached screenshot for ${projectName}`)
      return cached
    }

    // Strategy 3: Generate attractive placeholder
    console.log(`🎨 Generating placeholder for ${projectName}`)
    return this.generatePlaceholder({
      projectName,
      description: `${framework ? `${framework} ` : ''}application showcasing modern development practices`,
      technologies: technologies || [],
      framework
    })
  }

  /**
   * Sanitize filename for file system
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

// Singleton instance
let fallbackStrategiesService: FallbackStrategiesService | null = null

export function getFallbackStrategiesService(): FallbackStrategiesService {
  if (!fallbackStrategiesService) {
    fallbackStrategiesService = new FallbackStrategiesService()
  }
  return fallbackStrategiesService
}