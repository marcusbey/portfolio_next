import { LinkPreview } from "./LinkPreview";

export const Hero = () => {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-20 px-8">
      <h1 className="font-bold text-3xl md:text-5xl leading-tight text-zinc-50 max-w-3xl">
        From blueprints to binary:{" "}
        <span className="text-cyan-500">crafting tomorrow's interfaces</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-8 leading-loose tracking-wide">
        Architect turned tech innovator. I design digital spaces where AI
        enhances human potential, not replaces it. Every pixel, every
        interaction is an opportunity to bridge the gap between what users need
        and what technology can deliver.
      </p>

      <div className="mt-6 text-zinc-400 text-sm md:text-base max-w-2xl leading-loose tracking-wide">
        <p>
          Vim enthusiast by day, research paper explorer by night. I thrive on
          unconventional problem-solving and believe the best solutions often
          hide in unexpected places. Currently working on{" "}
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
          , where every keystroke shapes tomorrow's experiences.
        </p>
      </div>
    </div>
  );
};
