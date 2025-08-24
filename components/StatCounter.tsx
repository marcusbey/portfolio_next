import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function StatCounter({ end, duration = 2, suffix = '', prefix = '' }: StatCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className="text-2xl md:text-3xl font-bold text-cyan-400">
      {prefix}{count}{suffix}
    </span>
  )
}

export function StatsSection() {
  const stats = [
    { label: 'Projects Completed', value: 50, suffix: '+' },
    { label: 'Years of Experience', value: 8, suffix: '+' },
    { label: 'Technologies Mastered', value: 25, suffix: '+' },
    { label: 'Happy Clients', value: 30, suffix: '+' }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="text-center p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30"
        >
          <StatCounter 
            end={stat.value} 
            suffix={stat.suffix}
            duration={2 + index * 0.2}
          />
          <p className="text-zinc-400 text-sm mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}