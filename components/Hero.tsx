import { LinkPreview } from "./LinkPreview";

export const Hero = () => {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-20 px-8">
      <h1 className="font-bold text-3xl md:text-5xl leading-tight text-zinc-50 max-w-3xl">
        Solving complex challenges with{" "}
        <span className="text-cyan-500">elegant simplicity</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-8 leading-loose tracking-wide">
        Passionate about transforming complex technical challenges into elegant, user-friendly solutions. 
        With a background in architecture, I bring a unique perspective to software development, 
        focusing on creating intuitive digital experiences that make technology more accessible and meaningful.
      </p>

      <div className="mt-6 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <p>
          Currently collaborating on projects that push the boundaries of what's possible in web development. 
          Contributing to{" "}
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
          </LinkPreview>
          , where we're building tools that help teams work more effectively together.
        </p>
      </div>
    </div>
  );
};
