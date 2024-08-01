import { Container } from "@/components/Container";
import { Projects } from "@/components/Projects";
import { Timeline } from "@/components/Timeline";
import { user } from "@/constants/user";
import Image from "next/image";
import {
  AiOutlineGithub,
  AiOutlineLinkedin,
  AiOutlineTwitter,
} from "react-icons/ai";

export default function ProjectsPage() {
  const socials = [
    {
      name: "twitter",
      icon: (
        <AiOutlineTwitter className="h-5 w-5 hover:text-primary transition duration-150" />
      ),
      link: user.twitter,
    },
    {
      name: "LinkedIn",
      icon: (
        <AiOutlineLinkedin className="h-5 w-5 hover:text-primary transition duration-150" />
      ),
      link: user.linkedin,
    },
    {
      name: "GitHub",
      icon: (
        <AiOutlineGithub className="h-5 w-5 hover:text-primary transition duration-150" />
      ),
      link: user.github,
    },
  ];
  return (
    <Container title={`Projects | 2omain 3030Ξ`}>
      <div className="max-w-5xl mx-auto px-8 md:mt-20 relative flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-10 justify-between">
        <div>
          <h1 className="font-bold text-3xl md:text-5xl md:leading-tight text-zinc-50 max-w-3xl">
            Hey! I'm
            <span className="text-cyan-500"> Romain BOBOE</span> and I'm a full
            stack soap engineer.
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-8 md:leading-loose tracking-wide">
            Technology has always been my passion, driving me to constantly
            learn and innovate. With a background in architecture and an
            entrepreneurial mindset, I bring a unique blend of creativity and
            technical expertise to solve real-world problems.
          </p>
        </div>

        <div className="order-first md:order-last">
          <Image
            src={`/images/avatar.jpg`}
            width={200}
            height={200}
            alt="Avatar"
            className="rounded-2xl"
          />
          <div className="flex flex-row justify-start md:justify-center space-x-2 mt-2">
            {socials.map((socialLink: any, idx: number) => (
              <a
                key={`footer-link-${idx}`}
                href={socialLink.link}
                className="text-zinc-500 text-sm relative"
                target="__blank"
              >
                <span className="relative z-10 px-2 py-2 inline-block hover:text-cyan-500">
                  {socialLink.icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 mt-10 relative">
        <h2 className="font-bold text-2xl text-zinc-50">A Dad Who Codes</h2>
        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          When I'm not developing innovative solutions, I proudly wear the hat
          of a dad. Balancing family life with my professional pursuits keeps me
          grounded and inspired. My children remind me of the importance of
          solving problems that matter, and I strive to create products that
          genuinely make a difference.
        </p>

        <h2 className="font-bold text-2xl text-zinc-50">
          AI and Fullstack Consulting
        </h2>
        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          As a consultant for AI-driven solutions and fullstack applications, I
          help businesses leverage technology to achieve their goals. I'm
          constantly learning and staying up-to-date with the latest
          advancements to provide cutting-edge solutions. My journey in tech is
          ever-evolving, and I’m excited about what the future holds.
        </p>

        <h2 className="font-bold text-2xl text-zinc-50">
          Creating and Designing
        </h2>
        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          I'm passionate about building products that solve real problems.
          Whether it's crafting beautiful websites or functional applications,
          my aim is to design experiences that are intuitive and user-friendly.
          Even with my busy schedule, I still find time to design, channeling my
          architectural background into every project.
        </p>

        <h2 className="font-bold text-2xl text-zinc-50">
          Nature and Adventure Enthusiast
        </h2>
        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          Outside the tech world, you'll find me embracing nature and seeking
          adventure. Whether it's hiking through the woods or exploring new
          landscapes, I find inspiration in the great outdoors. This love for
          nature fuels my creativity and keeps my spirit adventurous.
        </p>
      </div>
      <div className="mt-40 max-w-5xl mx-auto px-8 relative">
        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          When I'm not busy slaying bugs and writing code, I'm usually busy
          indulging in my two favorite hobbies: hot sauce and dad jokes. I
          firmly believe that a good laugh and a dash of hot sauce can fix just
          about anything, including bugs in my code (okay, maybe not that last
          part).
        </p>

        <p className="text-zinc-400 text-sm md:text-base mt-8 md:leading-loose tracking-wide">
          Here's a timeline of what I've been upto
        </p>
        <Timeline />
      </div>
    </Container>
  );
}
