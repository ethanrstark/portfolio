import type { ResumeInfo } from "./types";
import resumeUrl from "@/assets/resume/resume.pdf?url";

// Replace src/assets/resume/resume.pdf with a newer file (keeping the name) and update lastUpdated.
export const resumeInfo: ResumeInfo = {
  summary: "Here's my latest resume. Read it below, open, or download a copy.",
  // Imported (not typed as a path) so the build bundles the file and gives it a working address.
  fileUrl: resumeUrl,
  lastUpdated: "2026-10-27",
};
