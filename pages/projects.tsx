import { Container } from "@/components/Container";
import { EnhancedProjectsV2 } from "@/components/EnhancedProjectsV2";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  CodeBracketIcon, 
  RocketLaunchIcon, 
  SparklesIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CommandLineIcon,
  LightBulbIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([])
  const [activeFilter, setActiveFilter] = useState("All Projects")
  const [loading, setLoading] = useState(true)

  const stats = [
    { label: "Projects Built", value: "16+", icon: CodeBracketIcon },
    { label: "Technologies Used", value: "25+", icon: SparklesIcon },
    { label: "Years Coding", value: "15+", icon: RocketLaunchIcon },
  ];

  const categories = ["All Projects", "AI/ML", "Web Design", "Mobile App", "Web App", "MVP"];

  const techHighlights = [
    { name: "Next.js", icon: CommandLineIcon, count: "8 projects", description: "Full-stack React framework" },
    { name: "AI Integration", icon: CpuChipIcon, count: "5 projects", description: "Machine learning & AI features" },
    { name: "TypeScript", icon: CodeBracketIcon, count: "12 projects", description: "Type-safe development" },
    { name: "API Development", icon: GlobeAltIcon, count: "10 projects", description: "RESTful & GraphQL APIs" }
  ];

  const achievements = [
    { title: "Open Source Contributions", value: "25+", description: "Commits to various repositories" },
    { title: "API Integrations", value: "15+", description: "Third-party service connections" },
    { title: "Deployments", value: "50+", description: "Production applications launched" }
  ];

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [])

  // Filter projects when activeFilter changes
  useEffect(() => {
    filterProjects()
  }, [projects, activeFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    if (activeFilter === "All Projects") {
      setFilteredProjects(projects)
      return
    }

    const filtered = projects.filter(project => {
      const techStack = project.techStack || []
      const category = project.category || ''
      const projectType = project.projectType || ''
      const name = project.name.toLowerCase()
      const description = project.description?.toLowerCase() || ''

      switch (activeFilter) {
        case "AI/ML":
          // Check for AI/ML technologies in tech stack
          const hasAITech = techStack.some(tech => 
            ['OpenAI', 'TensorFlow', 'Python', 'LangChain', 'FastAPI'].includes(tech)
          )
          // Check for AI-related terms in name or description
          const hasAITerms = name.includes('ai') || 
                            name.includes('ml') || 
                            name.includes('smart') ||
                            description.includes('ai') || 
                            description.includes('intelligent') ||
                            description.includes('automation') ||
                            description.includes('transform') ||
                            description.includes('quiz')
          
          return hasAITech || hasAITerms

        case "Web Design":
          // Focus on portfolio, design-focused, or frontend-heavy projects
          const isDesignFocused = name.includes('portfolio') ||
                                name.includes('landing') ||
                                name.includes('design') ||
                                description.includes('showcase') ||
                                description.includes('portfolio') ||
                                description.includes('design')
          
          // Simple frontend projects with styling focus
          const isStyleFocused = techStack.includes('Tailwind CSS') && 
                                techStack.includes('Framer Motion') &&
                                !techStack.some(tech => ['PostgreSQL', 'MongoDB', 'Express', 'FastAPI'].includes(tech))
          
          return isDesignFocused || isStyleFocused

        case "Mobile App":
          // Check for mobile-specific technologies or terms
          return techStack.some(tech => 
            ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Ionic'].includes(tech)
          ) || 
          name.includes('mobile') ||
          name.includes('app') && !name.includes('web') ||
          description.includes('mobile')

        case "Web App":
          // Full-stack web applications with backend and database
          const hasBackend = techStack.some(tech => 
            ['Node.js', 'Express', 'FastAPI', 'Django', 'Flask'].includes(tech)
          )
          const hasDatabase = techStack.some(tech => 
            ['PostgreSQL', 'MongoDB', 'MySQL', 'Prisma', 'Supabase', 'Redis'].includes(tech)
          )
          const hasFrontend = techStack.some(tech => 
            ['React', 'Next.js', 'Vue.js', 'Angular'].includes(tech)
          )
          
          // Must have backend capabilities, not be a simple portfolio/landing page
          const isComplexApp = (hasBackend || hasDatabase) && 
                              hasFrontend &&
                              !name.includes('portfolio') &&
                              !name.includes('landing') &&
                              !description.includes('portfolio showcase')
          
          return isComplexApp

        case "MVP":
          // Look for simple prototypes, community platforms, or quick solutions
          const isCommunityOrSimple = description.includes('community') ||
                                     description.includes('platform') ||
                                     description.includes('solution') ||
                                     name.includes('widget') ||
                                     name.includes('now')
          
          const isSimpleTech = techStack.length <= 6 && 
                              techStack.includes('Next.js') &&
                              !techStack.some(tech => ['PostgreSQL', 'MongoDB', 'Express', 'FastAPI'].includes(tech))
          
          return isCommunityOrSimple || isSimpleTech

        default:
          return true
      }
    })

    setFilteredProjects(filtered)
  }

  const handleFilterChange = (category: string) => {
    setActiveFilter(category)
  }

  // Helper function to calculate count for a specific filter
  const getFilterCount = (filterCategory: string) => {
    if (filterCategory === "All Projects") {
      return projects.length
    }

    const filtered = projects.filter(project => {
      const techStack = project.techStack || []
      const name = project.name.toLowerCase()
      const description = project.description?.toLowerCase() || ''

      switch (filterCategory) {
        case "AI/ML":
          const hasAITech = techStack.some(tech => 
            ['OpenAI', 'TensorFlow', 'Python', 'LangChain', 'FastAPI'].includes(tech)
          )
          const hasAITerms = name.includes('ai') || 
                            name.includes('ml') || 
                            name.includes('smart') ||
                            description.includes('ai') || 
                            description.includes('intelligent') ||
                            description.includes('automation') ||
                            description.includes('transform') ||
                            description.includes('quiz')
          return hasAITech || hasAITerms

        case "Web Design":
          const isDesignFocused = name.includes('portfolio') ||
                                name.includes('landing') ||
                                name.includes('design') ||
                                description.includes('showcase') ||
                                description.includes('portfolio') ||
                                description.includes('design')
          const isStyleFocused = techStack.includes('Tailwind CSS') && 
                                techStack.includes('Framer Motion') &&
                                !techStack.some(tech => ['PostgreSQL', 'MongoDB', 'Express', 'FastAPI'].includes(tech))
          return isDesignFocused || isStyleFocused

        case "Mobile App":
          return techStack.some(tech => 
            ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Ionic'].includes(tech)
          ) || 
          name.includes('mobile') ||
          name.includes('app') && !name.includes('web') ||
          description.includes('mobile')

        case "Web App":
          const hasBackend = techStack.some(tech => 
            ['Node.js', 'Express', 'FastAPI', 'Django', 'Flask'].includes(tech)
          )
          const hasDatabase = techStack.some(tech => 
            ['PostgreSQL', 'MongoDB', 'MySQL', 'Prisma', 'Supabase', 'Redis'].includes(tech)
          )
          const hasFrontend = techStack.some(tech => 
            ['React', 'Next.js', 'Vue.js', 'Angular'].includes(tech)
          )
          const isComplexApp = (hasBackend || hasDatabase) && 
                              hasFrontend &&
                              !name.includes('portfolio') &&
                              !name.includes('landing') &&
                              !description.includes('portfolio showcase')
          return isComplexApp

        case "MVP":
          const isCommunityOrSimple = description.includes('community') ||
                                     description.includes('platform') ||
                                     description.includes('solution') ||
                                     name.includes('widget') ||
                                     name.includes('now')
          const isSimpleTech = techStack.length <= 6 && 
                              techStack.includes('Next.js') &&
                              !techStack.some(tech => ['PostgreSQL', 'MongoDB', 'Express', 'FastAPI'].includes(tech))
          return isCommunityOrSimple || isSimpleTech

        default:
          return true
      }
    })

    return filtered.length
  }

  return (
    <Container title={`Projects | Romain BOBOE - Full Stack Developer`}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10 md:mt-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-bold text-4xl md:text-6xl md:leading-tight text-zinc-50 max-w-4xl mx-auto">
            Building the Future, One
            <span className="text-cyan-500"> Project at a Time</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mt-8 md:leading-relaxed">
            From AI-powered applications to modern web experiences, explore my journey 
            through code. Each project represents a learning milestone, a problem solved, 
            or an idea brought to life.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <stat.icon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-zinc-50 mb-2">
                {stat.value}
              </div>
              <div className="text-zinc-400 text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="flex flex-wrap gap-3 p-2 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === activeFilter
                    ? "bg-cyan-500 text-white"
                    : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                {category}
                {category !== "All Projects" && (
                  <span className="ml-2 text-xs opacity-70">
                    ({getFilterCount(category)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filter Results */}
        {activeFilter !== "All Projects" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <p className="text-zinc-400">
              Showing <span className="text-cyan-400 font-medium">{filteredProjects.length}</span> projects in 
              <span className="text-zinc-300 font-medium"> {activeFilter}</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Projects Grid */}
      <EnhancedProjectsV2 
        projects={filteredProjects} 
        loading={loading}
        error={null}
      />

      {/* Parallax Tech Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white px-4"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Pushing the Boundaries
            </h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
              Where innovation meets implementation. Every line of code is a step toward 
              building the future of technology.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
            <p className="text-zinc-400 text-sm">Client Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">48h</div>
            <p className="text-zinc-400 text-sm">Average Response</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
            <p className="text-zinc-400 text-sm">Uptime Guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">5★</div>
            <p className="text-zinc-400 text-sm">Quality Rating</p>
          </div>
        </div>
      </motion.div>

      {/* Technology Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 py-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4 text-center">
          Technology Stack
        </h2>
        <p className="text-zinc-400 text-center mb-12 max-w-3xl mx-auto">
          I leverage modern technologies and frameworks to build scalable, performant applications 
          that solve real-world problems and deliver exceptional user experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techHighlights.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <tech.icon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-cyan-400 transition-colors">
                {tech.name}
              </h3>
              <p className="text-cyan-400 text-sm font-medium mb-2">{tech.count}</p>
              <p className="text-zinc-400 text-sm">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 py-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-12 text-center">
          Development Milestones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <ChartBarIcon className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-zinc-50 mb-2">
                {achievement.value}
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">
                {achievement.title}
              </h3>
              <p className="text-zinc-400 text-sm">
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Development Philosophy */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <LightBulbIcon className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-6">
          Development Philosophy
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          "Every project is an opportunity to learn something new, solve a meaningful problem, 
          or push the boundaries of what's possible with code. I believe in writing clean, 
          maintainable code that not only works today but can evolve with tomorrow's needs. 
          The best applications are those that users love to use and developers love to maintain."
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50">
            Clean Code
          </span>
          <span className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50">
            User-Centered Design
          </span>
          <span className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50">
            Continuous Learning
          </span>
          <span className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50">
            Innovation Focus
          </span>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-4">
          Have a Project in Mind?
        </h2>
        <p className="text-zinc-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
          I'm always excited to work on new challenges and bring innovative ideas to life. 
          Let's build something amazing together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Start a Project
          </a>
          <a
            href="/hobbies"
            className="px-8 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
          >
            See My Hobbies
          </a>
        </div>
      </motion.div>
    </Container>
  );
}
