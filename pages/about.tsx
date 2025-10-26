import { Container } from "@/components/Container";
import { Timeline } from "@/components/Timeline";
import { SkillsGrid } from "@/components/SkillsGrid";
import { StatsSection } from "@/components/StatCounter";
import { user } from "@/constants/user";
import { motion } from "framer-motion";
import Image from "next/image";
import { Hand } from "lucide-react";
import {
  AiOutlineGithub,
  AiOutlineLinkedin,
  AiOutlineTwitter,
  AiOutlineYoutube,
  AiOutlineInstagram,
} from "react-icons/ai";
import { 
  HiOutlineCode, 
  HiOutlineAcademicCap, 
  HiOutlineLightBulb,
  HiOutlineHeart,
  HiOutlineGlobeAlt,
  HiOutlineBriefcase
} from "react-icons/hi";

export default function AboutPage() {
  const socials = [
    {
      name: "Twitter",
      icon: <AiOutlineTwitter className="h-5 w-5" />,
      link: user.twitter,
      color: "hover:text-blue-400"
    },
    {
      name: "LinkedIn",
      icon: <AiOutlineLinkedin className="h-5 w-5" />,
      link: user.linkedin,
      color: "hover:text-blue-600"
    },
    {
      name: "GitHub",
      icon: <AiOutlineGithub className="h-5 w-5" />,
      link: user.github,
      color: "hover:text-gray-300"
    },
    {
      name: "YouTube",
      icon: <AiOutlineYoutube className="h-5 w-5" />,
      link: user.youtube,
      color: "hover:text-red-500"
    },
    {
      name: "Instagram",
      icon: <AiOutlineInstagram className="h-5 w-5" />,
      link: user.instagram,
      color: "hover:text-pink-400"
    },
  ];

  const highlights = [
    {
      icon: <HiOutlineCode className="w-6 h-6 text-cyan-400" />,
      title: "Full-Stack Developer",
      description: "Building end-to-end solutions with modern technologies"
    },
    {
      icon: <HiOutlineLightBulb className="w-6 h-6 text-yellow-400" />,
      title: "AI Enthusiast",
      description: "Leveraging artificial intelligence to solve complex problems"
    },
    {
      icon: <HiOutlineAcademicCap className="w-6 h-6 text-green-400" />,
      title: "Architecture Background",
      description: "Bringing design thinking to software development"
    },
    {
      icon: <HiOutlineBriefcase className="w-6 h-6 text-blue-400" />,
      title: "Entrepreneur",
      description: "Building products that make a real difference"
    },
    {
      icon: <HiOutlineHeart className="w-6 h-6 text-red-400" />,
      title: "Family Man",
      description: "Proud dad balancing family life with tech passion"
    },
    {
      icon: <HiOutlineGlobeAlt className="w-6 h-6 text-purple-400" />,
      title: "Nature Lover",
      description: "Finding inspiration in the great outdoors"
    }
  ];

  return (
    <Container title={`About | Romain BOBOE - Full Stack Developer`}>
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-8 md:mt-20 relative">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-10 md:space-y-0 md:space-x-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="font-bold text-3xl md:text-5xl md:leading-tight text-zinc-50 max-w-3xl">
              Hey! I'm
              <span className="text-cyan-500"> Romain BOBOE</span>, 
              a full-stack developer & AI consultant.
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-6 md:leading-loose tracking-wide">
              With a unique background in architecture and over 8 years in tech, I bring design thinking 
              to software development. I specialize in building AI-powered solutions and full-stack 
              applications that solve real-world problems.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <a 
                href="mailto:hi@romainboboe.com"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Get In Touch
              </a>
              <a 
                href="/resume.pdf"
                className="px-6 py-3 border border-zinc-600 hover:border-cyan-500 text-zinc-300 hover:text-cyan-400 rounded-lg font-medium transition-colors"
              >
                Download Resume
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <Image
                src={`/images/avatar.jpg`}
                width={240}
                height={240}
                alt="Romain BOBOE"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-cyan-500 rounded-full w-12 h-12 flex items-center justify-center">
                <Hand className="text-white w-6 h-6" />
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              {socials.map((social, idx) => (
                <motion.a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  className={`p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-400 ${social.color} transition-all duration-300 hover:scale-110 hover:border-zinc-600`}
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 text-center mb-4">
            By The Numbers
          </h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-8">
            Here's a snapshot of my journey in tech and the impact I've made.
          </p>
          <StatsSection />
        </motion.div>
      </div>

      {/* Highlights Grid */}
      <div className="max-w-5xl mx-auto px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 text-center mb-4">
            What Drives Me
          </h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-8">
            The values and passions that shape my approach to technology and life.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/30 hover:border-zinc-600/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {highlight.icon}
                  <h3 className="text-zinc-100 font-semibold ml-3">{highlight.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills Section */}
      <div className="max-w-5xl mx-auto px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 text-center mb-4">
            Technologies I Love
          </h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-8">
            The tools and technologies I use to bring ideas to life.
          </p>
          <SkillsGrid />
        </motion.div>
      </div>

      {/* Personal Story */}
      <div className="max-w-5xl mx-auto px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 border border-zinc-700/30"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-6">
            My Story
          </h2>
          
          <div className="space-y-6 text-zinc-400 leading-relaxed">
            <p>
              My journey into tech wasn't traditional. I started with a background in <strong className="text-zinc-300">architecture</strong>, 
              where I learned to think systematically about design, user experience, and solving complex problems. 
              This foundation has been invaluable in my approach to software development.
            </p>
            
            <p>
              Today, I'm passionate about <strong className="text-cyan-400">AI and machine learning</strong>, helping businesses 
              leverage these technologies to create meaningful solutions. Whether it's building full-stack applications, 
              implementing AI workflows, or consulting on digital transformation, I love tackling challenges that make a real impact.
            </p>
            
            <p>
              When I'm not coding, you'll find me being a <strong className="text-zinc-300">proud dad</strong>, exploring the 
              great outdoors, or experimenting with new technologies. I believe the best solutions come from a balance of 
              technical expertise, creative thinking, and real-world perspective.
            </p>
            
            <p className="text-zinc-300 font-medium">
              Fun fact: I'm convinced that a good dad joke and some hot sauce can solve most of life's problems 
              (though I'm still working on applying this to debugging!)
            </p>
          </div>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-5xl mx-auto px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 text-center mb-4">
            My Journey
          </h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-8">
            Here's a timeline of my professional adventure and key milestones.
          </p>
          <Timeline />
        </motion.div>
      </div>
    </Container>
  );
}