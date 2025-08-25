import { Container } from "@/components/Container";
import { motion } from "framer-motion";

export default function ArchitecturePage() {
  return (
    <Container title="Architecture | Romain BOBOE - Full Stack Developer">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-8xl mb-8">🏛️</div>
            <h1 className="font-bold text-5xl md:text-7xl text-white mb-6">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              I'm working on something special to showcase my architectural background 
              and the buildings I've worked on. Stay tuned!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
              >
                View My Projects
              </a>
              <a
                href="/contact"
                className="px-8 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Get In Touch
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </Container>
  );
}