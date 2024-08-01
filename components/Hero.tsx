import React from "react";
import { LinkPreview } from "./LinkPreview";

export const Hero = () => {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-20 px-8 ">
      <h1 className="font-bold text-3xl md:text-5xl leading-tight text-zinc-50 max-w-3xl">
        I'm a software engineer with{" "}
        <span className="text-cyan-500">a pencil in mind.</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-8 leading-loose tracking-wide">
        I'm a problem solver, a coder, and a designer. I love to build beautiful
        websites and applications. I'm passionate about creating functional and
        clean designs that are easy to use and understand.
      </p>
      <div className="mt-8 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
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
        when I'm not working on playing with my kids.
      </div>
    </div>
  );
};
