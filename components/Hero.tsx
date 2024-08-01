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
