import { useState } from 'react'
import { Project } from '@prisma/client'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  CameraIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline'

interface ProjectWithTechnologies extends Project {
  technologies: Array<{ id: string; technology: string }>
}

interface EnhancedProjectTableProps {
  projects: ProjectWithTechnologies[]
  onProjectUpdate: (projectId: string, updates: { 
    isVisible?: boolean; 
    description?: string;
    longDescription?: string;
    techStack?: string[];
    imageUrls?: string[];
  }) => void
  onRegenerateScreenshot?: (projectId: string) => void
}

export function EnhancedProjectTable({ 
  projects, 
  onProjectUpdate, 
  onRegenerateScreenshot 
}: EnhancedProjectTableProps) {
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [newDescription, setNewDescription] = useState('')
  const [editingLongDescription, setEditingLongDescription] = useState<string | null>(null)
  const [newLongDescription, setNewLongDescription] = useState('')
  const [editingImages, setEditingImages] = useState<string | null>(null)
  const [newImageUrls, setNewImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  const filteredProjects = projects.filter(project => {
    if (filter === 'visible') return project.isVisible
    if (filter === 'hidden') return !project.isVisible
    return true
  })

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

  const handleImagesEdit = (project: ProjectWithTechnologies) => {
    setEditingImages(project.id)
    const allImages = [project.imageUrl, ...(project.imageUrls || [])].filter(Boolean)
    setNewImageUrls(allImages)
    setNewImageUrl('')
  }

  const handleImageAdd = () => {
    if (newImageUrl.trim()) {
      setNewImageUrls([...newImageUrls, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleImageRemove = (index: number) => {
    setNewImageUrls(newImageUrls.filter((_, i) => i !== index))
  }

  const handleImagesSave = (projectId: string) => {
    // First image becomes the main imageUrl, rest go to imageUrls array
    const [mainImage, ...additionalImages] = newImageUrls
    onProjectUpdate(projectId, { imageUrls: additionalImages })
    setEditingImages(null)
    setNewImageUrls([])
    setNewImageUrl('')
  }

  const handleImagesCancel = () => {
    setEditingImages(null)
    setNewImageUrls([])
    setNewImageUrl('')
  }

  const getTechStackDisplay = (techStack: string[] = []) => {
    return techStack.slice(0, 6).join(', ') + (techStack.length > 6 ? '...' : '')
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
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tech Stack
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
                {/* Preview & Images */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingImages === project.id ? (
                    <div className="w-64 space-y-3">
                      {/* Image list */}
                      <div className="space-y-2">
                        {newImageUrls.map((url, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <img src={url} alt={`Preview ${index + 1}`} className="w-10 h-8 object-cover rounded" />
                            <div className="flex-1 text-xs text-gray-600 truncate">{url.substring(url.lastIndexOf('/') + 1)}</div>
                            <button
                              onClick={() => handleImageRemove(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new image */}
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Enter image URL..."
                          className="flex-1 text-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={handleImageAdd}
                          disabled={!newImageUrl.trim()}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Save/Cancel buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleImagesSave(project.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleImagesCancel}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden">
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
                            <PhotoIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      
                      {/* Multiple images indicator */}
                      {project.imageUrls && project.imageUrls.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          +{project.imageUrls.length}
                        </div>
                      )}
                      
                      {/* Edit images button */}
                      <button
                        onClick={() => handleImagesEdit(project)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Project Name */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" 
                         className="hover:text-blue-600">
                        {project.url.replace(/https?:\/\//, '').substring(0, 30)}...
                      </a>
                    ) : (
                      'No URL'
                    )}
                  </div>
                </td>

                {/* Description */}
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {editingDescription === project.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder="Enter project description..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDescriptionSave(project.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleDescriptionCancel}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <p className="text-sm text-gray-900 line-clamp-3">
                          {project.description || 'No description'}
                        </p>
                        <button
                          onClick={() => handleDescriptionEdit(project)}
                          className="mt-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* Tech Stack */}
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600 max-w-xs">
                    {project.techStack && project.techStack.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="text-gray-400">+{project.techStack.length - 4}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No tech stack</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.isVisible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onProjectUpdate(project.id, { isVisible: !project.isVisible })}
                      className={`${
                        project.isVisible ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'
                      }`}
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