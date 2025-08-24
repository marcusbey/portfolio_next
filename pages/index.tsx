import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { ProjectsV2 } from "@/components/ProjectsV2";
import { getUserRepositories } from "@/lib/github";
import { LatestRepos } from "@/components/LatestRepos";
import { Repository } from "@/types/repos";
import { Experience } from "@/components/Experience";
import { generateRssFeed } from "@/lib/generateRSSFeed";
import { getAllBlogs } from "@/lib/getAllBlogs";
import AllBlogs from "@/components/AllBlogs";
import { Uses } from "@/components/Uses";

// const inter = Inter({ subsets: ["latin"] });

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
      <ProjectsV2 />

      {/* 
      <h1 className="text-2xl md:text-3xl text-white font-bold max-w-5xl mx-auto px-8 mt-40">
        Latest contributions to open source
      </h1>
      <LatestRepos repos={repos.slice(0, 9)} showMore={shouldShowMore()} />

      <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 mt-40 ">
        <div className="col-span-2">
          <AllBlogs blogs={blogs} />
        </div>
        <Uses />
      </div> */}
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
