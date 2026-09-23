import { el, externalLink } from "@/ui/utils";
import { resumeInfo } from "@/portfolio/data/resume";

export function renderResumeViewer(): HTMLElement {
  const container = el("div", "section-content resume-viewer");
  container.append(el("p", "section-paragraph", resumeInfo.summary));
  container.append(el("p", "resume-viewer__updated", `Last updated: ${resumeInfo.lastUpdated}`));

  if (resumeInfo.fileUrl) {
    container.append(externalLink("Download Resume (PDF) ↗", resumeInfo.fileUrl, "link-pill link-pill--primary"));
  } else {
    container.append(el("p", "resume-viewer__placeholder", "[Placeholder] A downloadable PDF will be linked here."));
  }

  return container;
}
