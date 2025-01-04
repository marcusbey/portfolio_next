import {
  TbBrandReact,
  TbBrandTailwind,
  TbBrandTypescript,
  TbBrandVercel,
  TbBrandDocker,
} from "react-icons/tb";
import { SiGo, SiRemix, SiPostgresql, SiResend } from "react-icons/si";

export const stack = {
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
  postgres: {
    name: "PostgreSQL",
    id: "postgres",
    icon: <SiPostgresql className="h-5 w-5 stroke-1" />,
  },
  resend: {
    name: "Resend",
    id: "resend",
    icon: <SiResend className="h-5 w-5 stroke-1" />,
  },
  docker: {
    name: "Docker",
    id: "docker",
    icon: <TbBrandDocker className="h-5 w-5 stroke-1" />,
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
