import type { Project } from "./types";
import workloadPaper from "@/assets/projects/pbbs_benchmarking/workload_characterization_paper.pdf?url";
import educationRecPaper from "@/assets/projects/ml_education_rec/education_recommendation_system_report.pdf?url";

// Text fields can use **bold**, *emphasis*, `code` and [links](url) — see types.ts.
// Add `links` (github / demo / website / paper) and `media.images` to any project and the UI shows them.
//
// Left out on purpose (coursework-scale and overlapping with the systems projects below):
// Single-Cycle MIPS Processor (Logisim), Makefile Parser (C).
export const projects: Project[] = [
  {
    id: "scriptorium",
    title: "Scriptorium — Online Code Execution Platform",
    date: "Oct. - Dec. 2024",
    shortDescription: "A full-stack platform for running code in the browser and sharing it with others, built with a 3-person team.",
    description:
      "A code execution and content-sharing platform where users write and run programs, then share them through posts and comments. Built with a 3-person team as a full-stack TypeScript application.",
    highlights: [
      "**Backend:** designed a relational schema for users, code execution, posts, comments and sharing, and refined it through iterative testing against real use cases.",
      "**APIs:** built REST endpoints with CRUD operations, search, pagination and optimized queries, tested with Postman and wired into the React frontend.",
      "**Sandboxed execution:** ran submitted programs in Docker-based environments and returned the results to users.",
    ],
    technologies: ["TypeScript", "Node.js", "Next.js", "React", "Prisma", "SQLite", "Docker", "REST APIs", "Postman"],
    links: { github: "https://github.com/ethanrstark/scriptorium" },
    featured: true,
  },
  {
    id: "marketplace-app",
    title: "Marketplace App — Java / Spring Boot",
    date: "Original: Sept. - Dec. 2022 · Modernization: Sept. 2026 - Present",
    shortDescription: "An online marketplace built with a 7-person team using Clean Architecture, now being rebuilt on Spring Boot.",
    description:
      "An online marketplace designed and built in Java with a 7-person team, applying object-oriented design, SOLID principles and design patterns. It earned an **A+**, and I'm now modernizing it into a production-style Spring Boot backend.",
    highlights: [
      "**My part:** user profiles and reviews, including the interfaces for creating and editing profiles and reviewing other users.",
      "**Clean Architecture:** separated business rules from UI and infrastructure through dependency abstractions, improving testability and maintainability.",
      "**Modernization (in progress):** refactoring the original project onto Spring Boot with a REST API.",
    ],
    technologies: ["Java", "Spring Boot", "Clean Architecture", "SOLID", "Design Patterns", "REST API"],
    links: { github: "https://github.com/ethanrstark/scamazon" },
    badge: "Modernizing now",
    featured: true,
  },
  {
    id: "othello-ai",
    title: "Adversarial Game AI Engine",
    date: "Mar. 2025",
    shortDescription: "An Othello-playing AI using Minimax and Alpha-Beta pruning that picks its move within a 10-second limit.",
    description:
      "An AI agent in Python that plays Othello using Minimax with Alpha-Beta pruning, choosing the best move within a **10 second** limit on boards of different sizes.",
    highlights: [
      "**Faster search:** depth-limited search, a transposition table for state caching, and heuristic node ordering cut search time without weakening play.",
      "**Evaluation functions:** designed and compared custom heuristics using board position, mobility and game-state features to decide well under strict time limits.",
    ],
    technologies: ["Python", "Minimax", "Alpha-Beta Pruning", "Transposition Table", "Heuristics"],
    featured: true,
  },
  {
    id: "workload-characterization",
    title: "Single-Core Workload Characterization",
    date: "Jan. - Feb. 2025",
    shortDescription: "A performance study of the PBBS benchmark suite on simulated single-core systems.",
    description:
      "A workload characterization of the Problem-Based Benchmark Suite (PBBS) run in the gem5 simulator on different single-core systems, with the findings written up as a research report.",
    highlights: [
      "**Experiments:** measured performance across input sizes, processor pipeline designs and cache configurations.",
      "**Analysis:** compared in-order and out-of-order pipelines to find key bottlenecks and instruction-mix characteristics.",
      "**Automation:** wrote Python scripts to run the benchmarks, collect simulation data and plot trends with statistical analysis.",
    ],
    technologies: ["gem5", "Python", "PBBS", "Performance Analysis", "Computer Architecture"],
    links: { paper: workloadPaper },
  },
  {
    id: "fuse-file-system",
    title: "FUSE File System",
    date: "Nov. - Dec. 2024",
    shortDescription: "A working file system in C built on FUSE, with its own mkfs tool.",
    description:
      "A file system written in C using FUSE, with the core operations needed to create, read, write and manage files and directories.",
    highlights: [
      "**Operations:** file creation, deletion, reading, writing, truncation, metadata lookup and directory listing.",
      "**mkfs utility:** initializes the superblock, inodes and data-block bitmaps that hold file metadata and directory structure.",
      "**Storage management:** bitmap-based block allocation and deallocation that keeps the file system consistent.",
    ],
    technologies: ["C", "FUSE", "File Systems", "Bitmap Allocation"],
  },
  {
    id: "network-stack-router",
    title: "Network Stack & IPv4 Router",
    date: "Sept. - Nov. 2024",
    shortDescription: "A C++ network stack and IPv4 router that forwards packets across multiple interfaces.",
    description:
      "A network stack and IPv4 router in C++ that handles Ethernet frames, resolves addresses with ARP, and forwards packets between hosts and next-hop routers.",
    highlights: [
      "**ARP:** a cache plus request/reply protocol with packet queuing, cache expiration and request throttling for IP-to-MAC resolution.",
      "**Routing:** longest-prefix matching against a routing table to pick the next hop, with correct handling of TTL expiry and unreachable destinations.",
      "**Integration:** joined the link and network layers to route IP datagrams across several interfaces.",
    ],
    technologies: ["C++", "Networking", "Ethernet", "ARP", "IPv4", "Routing"],
  },
  {
    id: "threading-library",
    title: "User-Level Threading Library",
    date: "Sept. - Oct. 2024",
    shortDescription: "A threading library for Linux in C with cooperative and preemptive schedulers.",
    description:
      "A user-level threading library in C on Linux covering thread creation, lifecycle management, context switching, and both cooperative and preemptive scheduling.",
    highlights: [
      "**Schedulers:** priority-based, first-come-first-served and randomized, built on a circular ready queue and thread control blocks that track state, priority and context.",
      "**Preemption:** timer signals drive scheduling, with signals disabled during critical sections to prevent race conditions, plus mutex locks for safe concurrent code.",
      "**Debugging:** tracked down concurrency bugs and validated behaviour with targeted tests and GDB.",
    ],
    technologies: ["C", "Linux", "Concurrency", "Schedulers", "Signals", "Mutexes", "GDB"],
  },
  {
    id: "education-recommendation",
    title: "Education Platform Recommendation System",
    date: "Mar. - Apr. 2024",
    shortDescription: "Three machine-learning models that predict student answers, built with 3 teammates.",
    description:
      "A recommendation system for an education platform, built in Python with 3 teammates by comparing three different machine-learning approaches. The project scored **100%**.",
    highlights: [
      "**My model:** a single-parameter item response theory model in NumPy. I derived the log-likelihood and its derivatives for optimization and tuned hyperparameters to about **70% accuracy**, the best of the three models.",
      "**Team models:** helped complete and test the neural network and k-nearest-neighbours models using PyTorch and scikit-learn.",
      "**Analysis:** used Matplotlib to visualize each model's accuracy and parameters and compare their performance and limitations.",
    ],
    technologies: ["Python", "NumPy", "PyTorch", "scikit-learn", "Matplotlib", "Item Response Theory"],
    links: { paper: educationRecPaper },
    badge: "Scored 100%",
  },
];

// PLACEHOLDER — a secondary showcase for non-CS / creative work (art, game
// jams, music, writing). Not shown yet: the Creative section displays an
// "in progress" message until this is wired up (see sections.ts and UIManager.ts).
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
