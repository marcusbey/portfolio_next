import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import { 
  CubeTransparentIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CircleStackIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function ArchitecturePage() {
  const architecturalPrinciples = [
    {
      title: "Scalable Systems",
      description: "Building applications that grow with your business needs, from startup MVP to enterprise scale.",
      icon: ChartBarIcon,
      gradient: "from-blue-500/20 to-cyan-500/20",
      features: ["Microservices architecture", "Horizontal scaling", "Load balancing", "Auto-scaling infrastructure"]
    },
    {
      title: "Security First",
      description: "Implementing robust security measures at every layer, ensuring data protection and user privacy.",
      icon: ShieldCheckIcon,
      gradient: "from-green-500/20 to-emerald-500/20",
      features: ["Authentication & authorization", "Data encryption", "OWASP compliance", "Security auditing"]
    },
    {
      title: "Performance Optimized",
      description: "Creating lightning-fast applications through careful optimization and modern performance techniques.",
      icon: ArrowPathIcon,
      gradient: "from-orange-500/20 to-red-500/20",
      features: ["Code splitting", "Lazy loading", "CDN integration", "Database optimization"]
    },
    {
      title: "Cloud Native",
      description: "Leveraging cloud platforms for reliability, scalability, and global reach with modern DevOps practices.",
      icon: CloudIcon,
      gradient: "from-purple-500/20 to-indigo-500/20",
      features: ["Containerization", "CI/CD pipelines", "Infrastructure as Code", "Monitoring & logging"]
    }
  ];

  const techStack = {
    frontend: [
      { name: "React/Next.js", description: "Modern React framework with SSR/SSG", icon: CodeBracketIcon },
      { name: "TypeScript", description: "Type-safe JavaScript development", icon: CommandLineIcon },
      { name: "Tailwind CSS", description: "Utility-first CSS framework", icon: CubeTransparentIcon },
      { name: "Framer Motion", description: "Production-ready motion library", icon: DevicePhoneMobileIcon }
    ],
    backend: [
      { name: "Node.js", description: "JavaScript runtime for server-side development", icon: ServerIcon },
      { name: "Express/FastAPI", description: "Web frameworks for API development", icon: GlobeAltIcon },
      { name: "PostgreSQL", description: "Robust relational database", icon: CircleStackIcon },
      { name: "Prisma", description: "Type-safe database ORM", icon: CommandLineIcon }
    ],
    infrastructure: [
      { name: "Vercel/AWS", description: "Cloud deployment platforms", icon: CloudIcon },
      { name: "Docker", description: "Containerization platform", icon: CubeTransparentIcon },
      { name: "Redis", description: "In-memory data structure store", icon: CircleStackIcon },
      { name: "Monitoring", description: "Application performance monitoring", icon: ChartBarIcon }
    ]
  };

  const architecturePatterns = [
    {
      name: "JAMstack Architecture",
      description: "JavaScript, APIs, and Markup for fast, secure, and scalable web applications",
      useCases: ["Static sites", "E-commerce", "Blogs", "Marketing websites"],
      technologies: ["Next.js", "Gatsby", "Strapi", "Netlify"]
    },
    {
      name: "Microservices",
      description: "Distributed system architecture with independently deployable services",
      useCases: ["Large applications", "Team scaling", "Technology diversity", "Independent deployment"],
      technologies: ["Docker", "Kubernetes", "API Gateway", "Service mesh"]
    },
    {
      name: "Serverless",
      description: "Event-driven architecture with automatic scaling and reduced operational overhead",
      useCases: ["Event processing", "APIs", "Background tasks", "Real-time applications"],
      technologies: ["AWS Lambda", "Vercel Functions", "Supabase", "Planetscale"]
    },
    {
      name: "Full-Stack Monolith",
      description: "Integrated application with unified codebase for rapid development and deployment",
      useCases: ["MVPs", "Small teams", "Rapid prototyping", "Simple applications"],
      technologies: ["Next.js", "T3 Stack", "Rails", "Django"]
    }
  ];

  return (
    <Container title="Architecture | Romain BOBOE - Full Stack Developer">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-bold text-4xl md:text-6xl md:leading-tight text-zinc-50 max-w-4xl mx-auto">
            Building Robust
            <span className="text-cyan-500"> Architecture</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mt-8 md:leading-relaxed">
            From concept to deployment, I architect scalable, secure, and performant solutions 
            that stand the test of time. Every system is designed with growth, maintainability, 
            and user experience in mind.
          </p>
        </motion.div>

        {/* Architectural Principles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-12 text-center">
            Core Principles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {architecturalPrinciples.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative p-8 rounded-xl bg-gradient-to-br ${principle.gradient} border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group`}
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-zinc-800/50 rounded-lg border border-cyan-500/20">
                    <principle.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-50 mb-4 group-hover:text-cyan-400 transition-colors">
                  {principle.title}
                </h3>
                
                <p className="text-zinc-400 leading-relaxed mb-6">
                  {principle.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {principle.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-zinc-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-12 text-center">
            Technology Stack
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(techStack).map(([category, technologies], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-700/30"
              >
                <h3 className="text-xl font-bold text-zinc-50 mb-6 capitalize">
                  {category}
                </h3>
                
                <div className="space-y-4">
                  {technologies.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 + techIndex * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 flex-shrink-0">
                        <tech.icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-zinc-300 font-medium group-hover:text-cyan-400 transition-colors">
                          {tech.name}
                        </h4>
                        <p className="text-zinc-500 text-sm">{tech.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Architecture Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-12 text-center">
            Architecture Patterns
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {architecturePatterns.map((pattern, index) => (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <h3 className="text-xl font-bold text-zinc-50 mb-3 group-hover:text-cyan-400 transition-colors">
                  {pattern.name}
                </h3>
                <p className="text-zinc-400 mb-4 leading-relaxed">
                  {pattern.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">Use Cases:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pattern.useCases.map((useCase, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-zinc-800/50 text-zinc-400 rounded border border-zinc-700/30"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pattern.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto py-16"
        >
          <CpuChipIcon className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-6">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Let's discuss your project requirements and architect a solution that scales with your vision. 
            From MVP to enterprise, I'll design the right architecture for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Discuss Your Project
            </a>
            <a
              href="/projects"
              className="px-8 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
            >
              View My Work
            </a>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}