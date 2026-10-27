import type { ExperienceEntry } from "./types";

// PLACEHOLDER CONTENT — replace with real roles, employers, and dates.
export const experience: ExperienceEntry[] = [
  {
    id: "role-one",
    role: "Software Engineering Intern - AI Systems",
    organization: "Huawei Canada Research Institute",
    startDate: "May 2025",
    endDate: "Aug. 2026",
    location: "Markham, ON",
    summary: "Worked on AI-powered voice-assistant systems, mobile applications, and real-time audio infrastructure deployed on production devices impacting a large scale of users.",
    highlights: [
      "**Android Development:** Independently built two Kotlin applications, integrating ONNX model inference, multichannel audio streaming, and coroutines. Contributed to a voice-assistant project from prototype through deployment on production devices.",
      "**Real-Time Audio Systems:** Engineered a modular Python audio-processing framework for concurrent capture, playback, and routing, with automated testing.",
      "**AI Data Pipeline:** Built a synthetic audio generation pipeline that produced 100+ hours of training data in minutes, replacing hundreds of hours of manual collection.",
      "**AI Infrastructure:** Developed and debugged AI workloads on Linux using Docker, vLLM, CUDA, and Android emulators, resolving GPU, dependency, and runtime issues.",
      "**Engineering Collaboration:** Worked with senior engineers and researchers through technical presentations, documentation, code reviews, and independent debugging.",
    ],
    technologies: ["Python", "Kotlin", "Android", "ONNX", "Multithreading", "Real-Time Audio Processing", "Linux", "Docker", "vLLM", "CUDA", "Automated Testing"],
  },
];
