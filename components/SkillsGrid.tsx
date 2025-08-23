import { motion } from 'framer-motion'
import { 
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, 
  SiNodedotjs, SiPython, SiPostgresql, SiDocker,
  SiVercel, SiGit, SiFigma, SiAmazonaws
} from 'react-icons/si'
import { HiOutlineCode } from 'react-icons/hi'

// Safe icon check - use fallback if icon is undefined
const safeIcon = (icon: any) => icon || HiOutlineCode

const skills = [
  { name: 'React', icon: safeIcon(SiReact), color: 'text-blue-400' },
  { name: 'Next.js', icon: safeIcon(SiNextdotjs), color: 'text-gray-300' },
  { name: 'TypeScript', icon: safeIcon(SiTypescript), color: 'text-blue-600' },
  { name: 'Tailwind CSS', icon: safeIcon(SiTailwindcss), color: 'text-cyan-400' },
  { name: 'Node.js', icon: safeIcon(SiNodedotjs), color: 'text-green-500' },
  { name: 'Python', icon: safeIcon(SiPython), color: 'text-yellow-400' },
  { name: 'PostgreSQL', icon: safeIcon(SiPostgresql), color: 'text-blue-500' },
  { name: 'Docker', icon: safeIcon(SiDocker), color: 'text-blue-400' },
  { name: 'Vercel', icon: safeIcon(SiVercel), color: 'text-white' },
  { name: 'AWS', icon: safeIcon(SiAmazonaws), color: 'text-orange-400' },
  { name: 'Git', icon: safeIcon(SiGit), color: 'text-orange-500' },
  { name: 'Figma', icon: safeIcon(SiFigma), color: 'text-purple-400' }
]

export function SkillsGrid() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-cyan-500/50 transition-all duration-300"
        >
          <skill.icon className={`w-8 h-8 ${skill.color} mb-2`} />
          <span className="text-zinc-300 text-xs font-medium text-center">
            {skill.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}