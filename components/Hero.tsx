import React from "react";
import { LinkPreview } from "./LinkPreview";

export const Hero = () => {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-20 px-8">
      <h1 className="font-bold text-3xl md:text-5xl leading-tight text-zinc-50 max-w-3xl">
        I’m a software engineer with an{" "}
        <span className="text-cyan-500">entrepreneurial mindset</span> and a{" "}
        <span className="text-cyan-500">background in architecture.</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-8 leading-loose tracking-wide">
        I excel in problem-solving, coding, and design, and I love creating
        beautiful, functional websites and applications. My passion lies in
        developing intuitive, clean designs that seamlessly blend form and
        function.
      </p>

      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <h2 className="font-bold text-2xl text-zinc-50">A Dad Who Codes</h2>
        <p>
          When I'm not developing innovative solutions, I proudly wear the hat
          of a dad. Balancing family life with my professional pursuits keeps me
          grounded and inspired. My children remind me of the importance of
          solving problems that matter, and I strive to create products that
          genuinely make a difference.
        </p>
      </div>

      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <h2 className="font-bold text-2xl text-zinc-50">
          AI and Fullstack Consulting
        </h2>
        <p>
          As a consultant for AI-driven solutions and fullstack applications, I
          help businesses leverage technology to achieve their goals. I'm
          constantly learning and staying up-to-date with the latest
          advancements to provide cutting-edge solutions. My journey in tech is
          ever-evolving, and I’m excited about what the future holds.
        </p>
      </div>

      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <h2 className="font-bold text-2xl text-zinc-50">
          Creating and Designing
        </h2>
        <p>
          I'm passionate about building products that solve real problems.
          Whether it's crafting beautiful websites or functional applications,
          my aim is to design experiences that are intuitive and user-friendly.
          Even with my busy schedule, I still find time to design, channeling my
          architectural background into every project.
        </p>
      </div>

      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <h2 className="font-bold text-2xl text-zinc-50">
          Nature and Adventure Enthusiast
        </h2>
        <p>
          Outside the tech world, you'll find me embracing nature and seeking
          adventure. Whether it's hiking through the woods or exploring new
          landscapes, I find inspiration in the great outdoors. This love for
          nature fuels my creativity and keeps my spirit adventurous.
        </p>
      </div>

      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <p>
          Building{" "}
          <LinkPreview
            className={
              "text-zinc-200 font-bold hover:text-cyan-500 transition duration-150 outline-none"
            }
            url="https://nownownow.io"
          >
            nownownow.io
          </LinkPreview>{" "}
          and{" "}
          <LinkPreview
            className={
              "text-zinc-200 font-bold hover:text-cyan-500 transition duration-150"
            }
            url="https://compozit.ca"
          >
            compozit.ca
          </LinkPreview>{" "}
          when I'm not playing with my kids.
        </p>
      </div>
    </div>
  );
};
