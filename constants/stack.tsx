import {
  TbBrandNextjs,
  TbBrandReact,
  TbBrandTailwind,
  TbBrandTypescript,
  TbBrandVercel,
} from "react-icons/tb";
import { SiGo, SiRemix } from "react-icons/si";

export const stack = {
  nextjs: {
    name: "Next.js",
    id: "nextjs",
    icon: <TbBrandNextjs className="h-5 w-5 stroke-1" />,
  },
  remix: {
    name: "Remix",
    id: "remix",
    icon: <SiRemix className="h-5 w-5 stroke-1" />,
  },
  golang: {
    name: "Golang",
    id: "golang",
    icon: <SiGo className="h-5 w-5 stroke-1" />,
  },
  vercel: {
    name: "Vercel",
    id: "vercel",
    icon: <TbBrandVercel className="h-5 w-5 stroke-1" />,
  },
  tailwindcss: {
    name: "Tailwind CSS",
    id: "tailwindcss",
    icon: <TbBrandTailwind className="h-5 w-5 stroke-1" />,
  },
  typescript: {
    name: "TypeScript",
    id: "typescript",
    icon: <TbBrandTypescript className="h-5 w-5 stroke-1" />,
  },
  react: {
    name: "React",
    id: "react",
    icon: <TbBrandReact className="h-5 w-5 stroke-1" />,
  },
};
