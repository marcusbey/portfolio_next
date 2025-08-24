import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineTerminal } from 'react-icons/hi'
import { stack } from '@/constants/stack'

interface ProjectData {
  id: string
  title: string
  description: string
  longDescription?: string
  image: string
  url: string
  githubUrl?: string
  stack: string[]
  projectType?: string
  category?: string
  status?: string
  difficulty?: string
  featured?: boolean
  createdAt: string
  updatedAt: string
  projectStartDate?: string
  projectEndDate?: string
}

interface ProjectsResponse {
  projects: ProjectData[]
}

export const ProjectsV2 = () => {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data: ProjectsResponse = await response.json()
      // Sort projects: featured first, then by creation date
      const sortedProjects = data.projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setProjects(sortedProjects)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
      
      // Fallback to static projects if API fails
      const { projects: staticProjects } = await import('@/constants/projects')
      const fallbackProjects = staticProjects.map((project, index) => ({
        id: `fallback-${index}`,
        title: project.title,
        description: project.description,
        image: project.image,
        url: project.link,
        stack: project.stack.map(s => s.name || s.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      setProjects(fallbackProjects)
    } finally {
      setLoading(false)
    }
  }

  const getStackIcon = (techName: string) => {
    const stackItem = Object.values(stack).find(s => 
      s.name.toLowerCase() === techName.toLowerCase() || 
      s.id.toLowerCase() === techName.toLowerCase()
    )
    return stackItem?.icon || null
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && projects.length === 0) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-red-900/20 border border-red-700/30 rounded-md p-4">
            <p className="text-red-400">Failed to load projects. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-md">
            <p className="text-yellow-400 text-sm">
              ⚠️ Using cached projects due to API error
            </p>
          </div>
        )}
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8 text-center text-zinc-50"
        >
          Featured Projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/10 group-hover:border-cyan-500/30 group-hover:bg-zinc-900/90">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback for broken images with better styling
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMTIxMjE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMGY3MjhkO3N0b3Atb3BhY2l0eTowLjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0IFByZXZpZXc8L3RleHQ+PC9zdmc+'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Featured badge */}
                  {project.featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ⭐ Featured
                      </div>
                    </div>
                  )}
                  
                  {/* Floating action button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-cyan-500/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.stack.slice(0, 6).map((tech, techIndex) => {
                      const icon = getStackIcon(tech)
                      return (
                        <div
                          key={techIndex}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-700/60 hover:border-cyan-500/40 hover:text-cyan-300 transition-all duration-200"
                          title={tech}
                        >
                          {icon && <span className="w-4 h-4 text-cyan-400">{icon}</span>}
                          <span>{tech}</span>
                        </div>
                      )
                    })}
                    {project.stack.length > 6 && (
                      <div className="flex items-center justify-center px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/40 rounded-lg text-xs text-zinc-500">
                        +{project.stack.length - 6}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center space-x-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          project.status === 'completed' ? 'bg-green-400' : 
                          project.status === 'in-progress' ? 'bg-yellow-400' : 
                          'bg-gray-400'
                        }`}></div>
                        {project.status === 'completed' ? 'Live' : project.status || 'Live'}
                      </span>
                      {project.projectType && (
                        <span className="px-2 py-0.5 bg-zinc-800/60 rounded text-zinc-400 font-medium">
                          {project.projectType}
                        </span>
                      )}
                      {project.difficulty && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          project.difficulty === 'beginner' ? 'bg-green-900/40 text-green-400' :
                          project.difficulty === 'intermediate' ? 'bg-yellow-900/40 text-yellow-400' :
                          project.difficulty === 'advanced' ? 'bg-red-900/40 text-red-400' :
                          'bg-zinc-800/60 text-zinc-400'
                        }`}>
                          {project.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-cyan-300 transition-colors"
                          title="View Source"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                        title="View Live Project"
                      >
                        <span className="text-sm">View</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No projects to display yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}