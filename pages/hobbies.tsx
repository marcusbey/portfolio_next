import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import { 
  CodeBracketIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  HeartIcon,
  LightBulbIcon,
  CogIcon,
  PuzzlePieceIcon,
  BeakerIcon
} from "@heroicons/react/24/outline";

export default function HobbiesPage() {
  const hobbies = [
    {
      title: "Building Applications",
      description: "Exploring new frameworks, experimenting with cutting-edge technologies, and creating innovative solutions to real-world problems.",
      icon: CodeBracketIcon,
      projects: ["AI-powered web apps", "Automation tools", "SaaS platforms", "Mobile applications"],
      gradient: "from-cyan-500/10 to-blue-500/10"
    },
    {
      title: "AI & Machine Learning",
      description: "Diving deep into artificial intelligence, studying neural networks, and building intelligent systems that can learn and adapt.",
      icon: BeakerIcon,
      projects: ["Neural network experiments", "Natural language processing", "Computer vision projects", "AI agent development"],
      gradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      title: "Reading & Learning",
      description: "Constantly expanding knowledge through books on AI, technology trends, business strategy, and personal development.",
      icon: BookOpenIcon,
      projects: ["AI research papers", "Tech industry books", "Automation guides", "Innovation studies"],
      gradient: "from-emerald-500/10 to-teal-500/10"
    },
    {
      title: "Fitness & Wellness",
      description: "Maintaining physical and mental health through consistent gym workouts, habit tracking, and mindful living practices.",
      icon: HeartIcon,
      projects: ["Strength training routines", "Habit tracking systems", "Wellness apps", "Fitness data analysis"],
      gradient: "from-red-500/10 to-orange-500/10"
    },
    {
      title: "Automation Enthusiast",
      description: "Creating systems and workflows that eliminate repetitive tasks and optimize productivity in both personal and professional life.",
      icon: CogIcon,
      projects: ["Home automation", "Workflow optimization", "Data pipeline creation", "Task scheduling systems"],
      gradient: "from-amber-500/10 to-yellow-500/10"
    },
    {
      title: "AI Agents Research",
      description: "Studying autonomous agents, multi-agent systems, and the future of AI-human collaboration in various industries.",
      icon: PuzzlePieceIcon,
      projects: ["Autonomous agent frameworks", "Multi-agent simulations", "AI collaboration tools", "Intelligent assistants"],
      gradient: "from-indigo-500/10 to-violet-500/10"
    }
  ];

  const currentReads = [
    { title: "The Alignment Problem", author: "Brian Christian", category: "AI Ethics" },
    { title: "Atomic Habits", author: "James Clear", category: "Personal Development" },
    { title: "Life 3.0", author: "Max Tegmark", category: "AI Future" },
    { title: "Automate the Boring Stuff", author: "Al Sweigart", category: "Programming" }
  ];

  const skills = [
    { name: "Machine Learning", level: 85 },
    { name: "Automation", level: 90 },
    { name: "Habit Tracking", level: 95 },
    { name: "AI Research", level: 80 },
    { name: "Fitness", level: 88 },
    { name: "System Design", level: 92 }
  ];

  return (
    <Container title="Hobbies & Interests | Romain BOBOE - Full Stack Developer">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-bold text-4xl md:text-6xl md:leading-tight text-zinc-50 max-w-4xl mx-auto">
            Beyond Code:
            <span className="text-cyan-500"> Passions & Pursuits</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mt-8 md:leading-relaxed">
            When I'm not building applications, I'm exploring the fascinating world of AI, 
            diving into books about automation, or tracking my fitness journey. Here's what 
            keeps me curious and motivated.
          </p>
        </motion.div>

        {/* Hobbies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative p-6 rounded-xl bg-gradient-to-br ${hobby.gradient} border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group`}
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-zinc-800/50 rounded-lg border border-cyan-500/20">
                  <hobby.icon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-zinc-50 mb-3 group-hover:text-cyan-400 transition-colors">
                {hobby.title}
              </h3>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {hobby.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Current Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hobby.projects.slice(0, 2).map((project, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-zinc-800/50 text-zinc-400 rounded border border-zinc-700/30"
                    >
                      {project}
                    </span>
                  ))}
                  {hobby.projects.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-zinc-800/30 text-zinc-500 rounded border border-zinc-700/20">
                      +{hobby.projects.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Currently Reading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-zinc-50 mb-8 text-center">
            Currently Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentReads.map((book, index) => (
              <motion.div
                key={book.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/30 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 flex-shrink-0">
                    <BookOpenIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-zinc-50 group-hover:text-cyan-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">by {book.author}</p>
                    <span className="inline-block text-xs px-2 py-1 bg-zinc-800/50 text-zinc-400 rounded mt-2">
                      {book.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills & Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-zinc-50 mb-8 text-center">
            Skill Development
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-medium">{skill.name}</span>
                  <span className="text-zinc-400 text-sm">{skill.level}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto py-16"
        >
          <LightBulbIcon className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-zinc-50 mb-6">
            My Philosophy
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            "The intersection of technology and human potential is where magic happens. 
            Whether it's building applications that solve real problems, exploring AI that 
            augments human capabilities, or maintaining the discipline to grow personally 
            and physically - it's all connected. Continuous learning, consistent habits, 
            and creative problem-solving are the foundations of a fulfilling life."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/projects"
              className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
            >
              View My Projects
            </a>
            <a
              href="/about"
              className="px-8 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
            >
              About Me
            </a>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}