import {
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiDocker,
  SiGo,
  SiRemix,
  SiPostgresql,
} from "react-icons/si";

import { HiMail } from "react-icons/hi";

export const stack = {
  remix: {
    name: "Remix",
    id: "remix",
    icon: <SiRemix className="h-5 w-5" />,
  },
  golang: {
    name: "Golang",
    id: "golang",
    icon: <SiGo className="h-5 w-5" />,
  },
  vercel: {
    name: "Vercel",
    id: "vercel",
    icon: <SiVercel className="h-5 w-5" />,
  },
  postgres: {
    name: "PostgreSQL",
    id: "postgres",
    icon: <SiPostgresql className="h-5 w-5" />,
  },
  resend: {
    name: "Resend",
    id: "resend",
    icon: <HiMail className="h-5 w-5" />,
  },
  docker: {
    name: "Docker",
    id: "docker",
    icon: <SiDocker className="h-5 w-5" />,
  },
  tailwindcss: {
    name: "Tailwind CSS",
    id: "tailwindcss",
    icon: <SiTailwindcss className="h-5 w-5" />,
  },
  typescript: {
    name: "TypeScript",
    id: "typescript",
    icon: <SiTypescript className="h-5 w-5" />,
  },
  react: {
    name: "React",
    id: "react",
    icon: <SiReact className="h-5 w-5" />,
  },
};
