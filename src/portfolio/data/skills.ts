import type { SkillCategory } from "./types";

export const skills: SkillCategory[] = [
  {
    id: "languages",
    name: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "Java", "Kotlin", "C++", "C", "SQL"],
  },
  {
    id: "web",
    name: "Backend & Web",
    skills: ["React", "Node.js", "Next.js", "REST APIs", "PostgreSQL", "Prisma", "HTML", "CSS", "TailwindCSS"],
  },
  {
    id: "ai",
    name: "AI & ML",
    skills: ["PyTorch", "ONNX", "NumPy", "Pandas", "scikit-learn", "Hugging Face", "vLLM", "CUDA"],
  },
  {
    id: "tools",
    name: "Tools",
    skills: ["Git", "Docker", "Postman", "Bash", "GDB", "LaTeX", "AI-assisted development tools"],
  },
  {
    id: "systems",
    name: "Systems & Hardware",
    skills: ["Linux", "Multithreading", "Concurrency", "Processes", "System Calls", "Networking", "TCP/IP", "Sockets", "Filesystems", "Computer Architecture"],
  },
];
