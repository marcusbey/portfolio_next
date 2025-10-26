import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { EnhancedProjectsV2 } from "@/components/EnhancedProjectsV2";
import { getUserRepositories } from "@/lib/github";
import { LatestRepos } from "@/components/LatestRepos";
import { Repository } from "@/types/repos";
import { Experience } from "@/components/Experience";
import { generateRssFeed } from "@/lib/generateRSSFeed";
import { getAllBlogs } from "@/lib/getAllBlogs";
import AllBlogs from "@/components/AllBlogs";
import { Uses } from "@/components/Uses";
import { motion } from "framer-motion";
import {
  CodeBracketIcon,
  BookOpenIcon,
  HeartIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { Dumbbell, BookOpen, Mountain } from "lucide-react";

// const inter = Inter({ subsets: ["latin"] }); // Updated for redeploy

export default function Home({
  repos,
  blogs,
}: {
  repos: Repository[];
  blogs: any;
}) {
  const shouldShowMore = () => {
    if (repos && repos.length > 9) {
      return true;
    }
    return false;
  };
  return (
    <Container>
      <Hero />
      <Experience />
      <h1 className="text-2xl md:text-3xl text-white font-bold max-w-5xl mx-auto px-8  mt-40">
        I've been building a lot of things
      </h1>
      <EnhancedProjectsV2 />

      {/* Hobbies Preview */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            When I'm Not Coding
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Life is more than just code. Here's what keeps me balanced and inspired.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group text-center"
          >
            <div className="mb-4">
              <Dumbbell className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-cyan-400 transition-colors">
              Fitness & Gym
            </h3>
            <p className="text-zinc-400 text-sm">
              Staying strong and healthy with regular workouts and habit tracking
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group text-center"
          >
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-cyan-400 transition-colors">
              AI & Automation
            </h3>
            <p className="text-zinc-400 text-sm">
              Exploring AI agents and building automation tools for daily life
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group text-center"
          >
            <div className="mb-4">
              <BookOpen className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-cyan-400 transition-colors">
              Learning & Reading
            </h3>
            <p className="text-zinc-400 text-sm">
              Always diving into new books about tech, AI, and personal growth
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/30 hover:border-cyan-500/30 transition-all duration-300 group text-center"
          >
            <div className="mb-4">
              <Mountain className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-cyan-400 transition-colors">
              Nature & Hiking
            </h3>
            <p className="text-zinc-400 text-sm">
              Finding peace and inspiration in nature's beauty
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="/hobbies"
            className="inline-flex items-center px-6 py-3 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors"
          >
            Learn More About My Interests
          </a>
        </motion.div>
      </div>
    </Container>
  );
}

export async function getStaticProps() {
  try {
    // FIXME: Add back the github api call
    // const res = await fetch("https://api.github.com/users/tylerdurden");
    // const data = await res.json();

    // FIXME: Add back the rss feed generation

    const data = await getUserRepositories("marcusbey");
    const blogs = await getAllBlogs();

    return {
      props: {
        repos: data || [],
        blogs: blogs
          .slice(0, 4)
          .map(({ component, ...meta }) => meta),
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        repos: [],
        blogs: [],
      },
    };
  }
}
