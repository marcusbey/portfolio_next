import { useState } from 'react'
import { Project } from '@prisma/client'
import { EyeIcon, EyeSlashIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, CheckIcon, XMarkIcon, CameraIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'

interface ProjectWithTechnologies extends Project {
  technologies: Array<{ id: string; technology: string }>
}

interface ProjectTableProps {
  projects: ProjectWithTechnologies[]
  onProjectUpdate: (projectId: string, updates: { 
    isVisible?: boolean; 
    displayOrder?: number; 
    url?: string;
    description?: string;
    longDescription?: string;
    techStack?: string[];
    imageUrls?: string[];
  }) => void
  onRegenerateScreenshot?: (projectId: string) => void
}

export function ProjectTable({ projects, onProjectUpdate, onRegenerateScreenshot }: ProjectTableProps) {
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [editingUrl, setEditingUrl] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [newDescription, setNewDescription] = useState('')
  const [editingLongDescription, setEditingLongDescription] = useState<string | null>(null)
  const [newLongDescription, setNewLongDescription] = useState('')
  const [showImageManager, setShowImageManager] = useState<string | null>(null)
  
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

  const handleUrlEdit = (project: ProjectWithTechnologies) => {
    setEditingUrl(project.id)
    setNewUrl(project.url || '')
  }

  const handleUrlSave = (projectId: string) => {
    onProjectUpdate(projectId, { url: newUrl })
    setEditingUrl(null)
    setNewUrl('')
  }

  const handleUrlCancel = () => {
    setEditingUrl(null)
    setNewUrl('')
  }

  const handleDescriptionEdit = (project: ProjectWithTechnologies) => {
    setEditingDescription(project.id)
    setNewDescription(project.description || '')
  }

  const handleDescriptionSave = (projectId: string) => {
    onProjectUpdate(projectId, { description: newDescription })
    setEditingDescription(null)
    setNewDescription('')
  }

  const handleDescriptionCancel = () => {
    setEditingDescription(null)
    setNewDescription('')
  }

  const handleLongDescriptionEdit = (project: ProjectWithTechnologies) => {
    setEditingLongDescription(project.id)
    setNewLongDescription(project.longDescription || '')
  }

  const handleLongDescriptionSave = (projectId: string) => {
    onProjectUpdate(projectId, { longDescription: newLongDescription })
    setEditingLongDescription(null)
    setNewLongDescription('')
  }

  const handleLongDescriptionCancel = () => {
    setEditingLongDescription(null)
    setNewLongDescription('')
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
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technologies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
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
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyMkMyOCAyMC44OTU0IDI4Ljg5NTQgMjAgMzAgMjBIMzRDMzUuMTA0NiAyMCAzNiAyMC44OTU0IDM2IDIyVjI2QzM2IDI3LjEwNDYgMzUuMTA0NiAyOCAzNCAyOEgzMEMyOC44OTU0IDI4IDI4IDI3LjEwNDYgMjggMjZWMjJaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </div>
                      {project.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {project.description || 'No description'}
                    </div>
                    <div className="mt-2 space-x-2">
                      {editingUrl === project.id ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-48"
                            placeholder="https://example.com"
                          />
                          <button
                            onClick={() => handleUrlSave(project.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save URL"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleUrlCancel}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {project.url ? (
                            <>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Live →
                              </a>
                              <button
                                onClick={() => handleUrlEdit(project)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Edit URL"
                              >
                                <PencilIcon className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUrlEdit(project)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              + Add URL
                            </button>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              GitHub →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.projectType || 'Web App'}
                    </span>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {project.category || 'fullstack'}
                      </span>
                    </div>
                    {project.framework && (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.framework}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {/* Display techStack array first (more comprehensive) */}
                    {project.techStack && project.techStack.length > 0 ? (
                      <>
                        {project.techStack.slice(0, 4).map((tech, index) => (
                          <span
                            key={`tech-${index}`}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{project.techStack.length - 4} more
                          </span>
                        )}
                      </>
                    ) : (
                      /* Fallback to technologies relations if techStack is empty */
                      <>
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {tech.technology}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                        {project.technologies.length === 0 && (
                          <span className="text-xs text-red-500">
                            No tech stack
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.isVisible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status || 'completed'}
                      </span>
                    </div>
                    {project.featured && (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                  </div>
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

                    {onRegenerateScreenshot && project.url && (
                      <button
                        onClick={() => onRegenerateScreenshot(project.id)}
                        className="text-gray-400 hover:text-cyan-600"
                        title="Regenerate screenshot"
                      >
                        <CameraIcon className="h-5 w-5" />
                      </button>
                    )}
                    
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