import { useState } from 'react'
import { Project } from '@prisma/client'
import { EyeIcon, EyeSlashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface ProjectWithTechnologies extends Project {
  technologies: Array<{ id: string; technology: string }>
}

interface ProjectTableProps {
  projects: ProjectWithTechnologies[]
  onProjectUpdate: (projectId: string, updates: { isVisible?: boolean; displayOrder?: number }) => void
}

export function ProjectTable({ projects, onProjectUpdate }: ProjectTableProps) {
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  
  const filteredProjects = projects.filter(project => {
    if (filter === 'visible') return project.isVisible
    if (filter === 'hidden') return !project.isVisible
    return true
  })

  const handleVisibilityToggle = (project: ProjectWithTechnologies) => {
    onProjectUpdate(project.id, { isVisible: !project.isVisible })
  }

  const handleOrderChange = (project: ProjectWithTechnologies, direction: 'up' | 'down') => {
    const visibleProjects = projects.filter(p => p.isVisible).sort((a, b) => a.displayOrder - b.displayOrder)
    const currentIndex = visibleProjects.findIndex(p => p.id === project.id)
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = visibleProjects[currentIndex - 1].displayOrder
      onProjectUpdate(project.id, { displayOrder: newOrder })
      onProjectUpdate(visibleProjects[currentIndex - 1].id, { displayOrder: project.displayOrder })
    } else if (direction === 'down' && currentIndex < visibleProjects.length - 1) {
      const newOrder = visibleProjects[currentIndex + 1].displayOrder
      onProjectUpdate(project.id, { displayOrder: newOrder })
      onProjectUpdate(visibleProjects[currentIndex + 1].id, { displayOrder: project.displayOrder })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
            Projects ({filteredProjects.length})
          </h2>
          
          <div className="flex space-x-2">
            {(['all', 'visible', 'hidden'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === filterOption
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Framework
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technologies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.description}
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Live →
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {project.framework || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tech.technology}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.isVisible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVisibilityToggle(project)}
                      className="text-gray-400 hover:text-gray-600"
                      title={project.isVisible ? 'Hide project' : 'Show project'}
                    >
                      {project.isVisible ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                    
                    {project.isVisible && (
                      <>
                        <button
                          onClick={() => handleOrderChange(project, 'up')}
                          className="text-gray-400 hover:text-gray-600"
                          title="Move up"
                        >
                          <ArrowUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOrderChange(project, 'down')}
                          className="text-gray-400 hover:text-gray-600"
                          title="Move down"
                        >
                          <ArrowDownIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}