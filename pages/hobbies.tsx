import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Dumbbell, Trees, BookOpen, Brain } from "lucide-react";

export default function HobbiesPage() {
  const hobbies = [
    {
      title: "Fitness & Gym",
      description: "Staying strong and consistent with my workout routine. The gym is my sanctuary where I push my limits and build discipline. I love the mental clarity that comes after a good session, and how it translates into better focus for coding.",
      longDescription: "There's something deeply satisfying about progressive overload - both in lifting weights and in life. Every rep, every set, every workout is building not just muscle, but character. I track my progress religiously and believe that physical fitness is the foundation for mental performance.",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      reverse: false
    },
    {
      title: "Nature & Hiking",
      description: "Finding peace and inspiration in the great outdoors. Whether it's a challenging mountain trail or a peaceful forest walk, nature resets my mind and gives me perspective. The best ideas often come when I'm disconnected from screens.",
      longDescription: "Nature is the ultimate debugger for the mind. When code gets complex and problems seem unsolvable, a hike in the mountains always provides clarity. The rhythm of walking, the fresh air, and the stunning views remind me that there's a whole world beyond the digital realm.",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      reverse: true
    },
    {
      title: "AI & Automation",
      description: "Exploring the fascinating world of artificial intelligence and building automation tools. I'm captivated by how AI can augment human capabilities and create more efficient workflows. Every day brings new possibilities.",
      longDescription: "We're living through the most exciting technological revolution in history. AI isn't just about writing code - it's about understanding patterns, solving complex problems, and creating tools that genuinely help people. I spend hours experimenting with new AI frameworks and building agents that can automate tedious tasks.",
      imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      reverse: false
    },
    {
      title: "Learning & Reading",
      description: "Constantly expanding my knowledge through books and research. From AI breakthroughs to personal development, I believe in lifelong learning. Every book is a conversation with brilliant minds who came before us.",
      longDescription: "Reading is like having a conversation with the smartest people who ever lived. I'm particularly drawn to books about technology, AI, automation, and personal growth. My kindle is full of highlights and notes - each book adding another layer to my understanding of the world.",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      reverse: true
    }
  ];

  return (
    <Container title="Hobbies & Interests | Romain BOBOE - Full Stack Developer">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="font-bold text-4xl md:text-6xl md:leading-tight text-zinc-50 max-w-4xl mx-auto">
            Life Beyond
            <span className="text-cyan-500"> Code</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mt-8 md:leading-relaxed">
            What keeps me balanced, inspired, and constantly growing as a person. 
            These aren't just hobbies - they're the foundations that make me a better developer and human.
          </p>
        </motion.div>

        {/* Hobbies with alternating image-text layout */}
        <div className="space-y-32">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                hobby.reverse ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative ${hobby.reverse ? 'lg:col-start-2' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl group"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={hobby.imageUrl}
                      alt={hobby.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-[#06b7d6] mix-blend-color opacity-20 pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Text Content */}
              <div className={`space-y-6 ${hobby.reverse ? 'lg:col-start-1' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, x: hobby.reverse ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-6">
                    {hobby.title}
                  </h2>
                  
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-6">
                    {hobby.description}
                  </p>
                  
                  <p className="text-zinc-400 leading-relaxed">
                    {hobby.longDescription}
                  </p>
                  
                  <div className="pt-4">
                    <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto py-32"
        >
          <div className="mb-8">
            <Star className="w-16 h-16 text-cyan-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-8">
            Balance Creates Better Code
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-12">
            The best developers aren't just technical experts - they're well-rounded individuals 
            who draw inspiration from diverse experiences. Whether I'm pushing weight at the gym, 
            hiking through mountain trails, diving into AI research, or getting lost in a good book, 
            each activity feeds back into my work, making me more creative, resilient, and insightful.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="mb-2">
                <Dumbbell className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-cyan-400 font-medium">Physical Strength</div>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-cyan-400 font-medium">Mental Clarity</div>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <Trees className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-cyan-400 font-medium">Natural Inspiration</div>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <BookOpen className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-cyan-400 font-medium">Continuous Learning</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/projects"
              className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
            >
              See My Work
            </a>
            <a
              href="/contact"
              className="px-8 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
            >
              Let's Connect
            </a>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}