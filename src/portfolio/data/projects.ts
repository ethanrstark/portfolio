import type { Project } from "./types";

// Simple placeholder "screenshot" graphics so the gallery/lightbox has
// something to display until real screenshots are dropped into
// src/assets/projects/. Swap Project.media.images for real file paths.
function placeholderScreenshot(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="${color}"/><text x="320" y="200" font-family="sans-serif" font-size="28" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// PLACEHOLDER CONTENT — swap in real projects. Fields are optional and the
// UI hides whatever isn't provided, so partial entries are fine.
export const projects: Project[] = [
  {
    id: "project-one",
    title: "[Placeholder] Project One",
    shortDescription: "A one-line summary of what this project does.",
    description:
      "[Placeholder] A longer description of the project: the problem it solves, your role, and anything technically interesting about how it was built.",
    technologies: ["TypeScript", "Phaser", "Vite"],
    links: {
      github: "https://github.com/your-username/project-one",
    },
    media: {
      images: [
        placeholderScreenshot("Screenshot 1", "#7a5230"),
        placeholderScreenshot("Screenshot 2", "#3c5a73"),
      ],
    },
    featured: true,
  },
  {
    id: "project-two",
    title: "[Placeholder] Project Two",
    shortDescription: "A one-line summary of what this project does.",
    description:
      "[Placeholder] Replace with a real project description, including notable challenges and outcomes.",
    technologies: ["Python", "Machine Learning"],
    links: {
      github: "https://github.com/your-username/project-two",
      demo: "https://example.com/demo",
    },
    featured: true,
  },
  {
    id: "project-three",
    title: "[Placeholder] Project Three",
    shortDescription: "A one-line summary of what this project does.",
    description: "[Placeholder] Replace with a real project description.",
    technologies: ["React", "Node.js"],
  },
];

// PLACEHOLDER — a secondary showcase for non-CS / creative work (art, game
// jams, music, writing). Maps to the "Creative Projects" building.
export const creativeProjects: Project[] = [
  {
    id: "creative-one",
    title: "[Placeholder] Creative Project One",
    shortDescription: "A short, non-technical passion project.",
    description:
      "[Placeholder] This section is for creative work outside of standard software projects — game jams, pixel art, music, writing, etc.",
    technologies: ["Pixel Art"],
  },
];
