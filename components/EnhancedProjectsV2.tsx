import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineTerminal, HiExternalLink, HiOutlinePhotograph } from 'react-icons/hi'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { 
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, 
  SiNodedotjs, SiPython, SiPostgresql, SiDocker,
  SiVercel, SiGit, SiFigma, SiAmazonaws, SiMongodb,
  SiExpress, SiVuedotjs, SiNuxtdotjs, SiSupabase,
  SiStripe, SiFramer, SiRedis, SiTensorflow,
  SiFastapi, SiPrisma, SiSanity, SiChartdotjs,
  SiD3Dotjs, SiSocketdotio, SiJavascript,
  SiHtml5, SiCss3, SiOpenai
} from 'react-icons/si'

interface ProjectData {
  id: string
  name: string
  description: string
  longDescription?: string
  imageUrl: string
  imageUrls?: string[]
  url: string
  githubUrl?: string
  techStack?: string[]
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

const techIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'TypeScript': SiTypescript,
  'JavaScript': SiJavascript,
  'Tailwind CSS': SiTailwindcss,
  'Node.js': SiNodedotjs,
  'Python': SiPython,
  'PostgreSQL': SiPostgresql,
  'MongoDB': SiMongodb,
  'Docker': SiDocker,
  'Vercel': SiVercel,
  'AWS': SiAmazonaws,
  'Express': SiExpress,
  'Vue.js': SiVuedotjs,
  'Nuxt.js': SiNuxtdotjs,
  'Supabase': SiSupabase,
  'Stripe': SiStripe,
  'Framer Motion': SiFramer,
  'Redis': SiRedis,
  'TensorFlow': SiTensorflow,
  'FastAPI': SiFastapi,
  'Prisma': SiPrisma,
  'Sanity CMS': SiSanity,
  'Chart.js': SiChartdotjs,
  'D3.js': SiD3Dotjs,
  'Socket.io': SiSocketdotio,
  'HTML5': SiHtml5,
  'CSS3': SiCss3,
  'OpenAI': SiOpenai
}

const ImageCarousel: React.FC<{ images: string[]; projectName: string }> = ({ images, projectName }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  if (!images || images.length <= 1) {
    return (
      <img
        src={images?.[0] || '/placeholder-project.jpg'}
        alt={projectName}
        className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
      />
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative h-72 overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`${projectName} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={prevImage}
          className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={nextImage}
          className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Image indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const TechStack: React.FC<{ technologies: string[] }> = ({ technologies }) => {
  const displayTechs = technologies?.slice(0, 8) || []
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {displayTechs.map((tech, index) => {
        const IconComponent = techIcons[tech]
        return (
          <div
            key={index}
            className="flex items-center space-x-1 bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-700/30 hover:border-cyan-500/30 transition-colors"
            title={tech}
          >
            {IconComponent ? (
              <IconComponent className="w-3 h-3 text-cyan-400" />
            ) : (
              <HiOutlineTerminal className="w-3 h-3 text-cyan-400" />
            )}
            <span className="text-xs text-zinc-300">{tech}</span>
          </div>
        )
      })}
      {technologies && technologies.length > 8 && (
        <div className="flex items-center px-2 py-1 rounded-md bg-zinc-800/30 border border-zinc-700/20">
          <span className="text-xs text-zinc-400">+{technologies.length - 8}</span>
        </div>
      )}
    </div>
  )
}

export const EnhancedProjectsV2 = () => {
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
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-700 rounded w-64 mb-8 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg h-80"></div>
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
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-red-900/20 border border-red-700/30 rounded-md p-4">
            <p className="text-red-400">Failed to load projects. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
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
          className="text-3xl font-bold mb-12 text-center text-zinc-50"
        >
          Featured Projects
        </motion.h2>

        {/* 2-column grid for larger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => {
            const allImages = [project.imageUrl, ...(project.imageUrls || [])].filter(Boolean)
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/10 group-hover:border-cyan-500/30 group-hover:bg-zinc-900/90">
                  {/* Image Carousel */}
                  <div className="relative overflow-hidden">
                    <ImageCarousel images={allImages} projectName={project.name} />
                    
                    {/* Featured badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                    
                    {/* Multiple images indicator */}
                    {allImages.length > 1 && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <HiOutlinePhotograph className="w-3 h-3" />
                          <span>{allImages.length}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-zinc-50 group-hover:text-cyan-400 transition-colors">
                        {project.name}
                      </h3>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-cyan-400 transition-colors ml-2 flex-shrink-0"
                        title="Visit project"
                      >
                        <HiExternalLink className="w-5 h-5" />
                      </a>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-300 text-base leading-relaxed mb-4 line-clamp-3">
                      {project.description || 'No description available'}
                    </p>

                    {/* Long description (if available) */}
                    {project.longDescription && project.longDescription !== project.description && (
                      <details className="mb-4">
                        <summary className="text-cyan-400 text-sm cursor-pointer hover:text-cyan-300 transition-colors">
                          Read more...
                        </summary>
                        <p className="text-zinc-400 text-base mt-2 leading-relaxed">
                          {project.longDescription}
                        </p>
                      </details>
                    )}

                    {/* Tech Stack */}
                    <TechStack technologies={project.techStack || []} />

                    {/* Project metadata */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-700/30">
                      <div className="flex space-x-4 text-xs text-zinc-500">
                        {project.category && (
                          <span className="bg-zinc-800/50 px-2 py-1 rounded">
                            {project.category}
                          </span>
                        )}
                        {project.projectType && (
                          <span className="bg-zinc-800/50 px-2 py-1 rounded">
                            {project.projectType}
                          </span>
                        )}
                      </div>
                      
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white transition-colors"
                          title="View source code"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No projects available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}