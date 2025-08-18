import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineTerminal } from 'react-icons/hi'
import { stack } from '@/constants/stack'

interface ProjectData {
  id: string
  title: string
  description: string
  image: string
  url: string
  stack: string[]
  createdAt: string
  updatedAt: string
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
      setProjects(data.projects)
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
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
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
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Failed to load projects. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              ⚠️ Using cached projects due to API error
            </p>
          </div>
        )}
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          I've been building a lot of things
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
              <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.stack.map((tech, techIndex) => {
                      const icon = getStackIcon(tech)
                      return (
                        <div
                          key={techIndex}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                          title={tech}
                        >
                          {icon && <span className="w-4 h-4">{icon}</span>}
                          <span>{tech}</span>
                        </div>
                      )
                    })}
                  </div>

                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <HiOutlineTerminal className="w-4 h-4" />
                    <span className="text-sm font-medium">View Source</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects to display yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}