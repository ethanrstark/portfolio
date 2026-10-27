import { el, externalLink, richEl } from "@/ui/utils";
import { resumeInfo } from "@/portfolio/data/resume";
import { experience } from "@/portfolio/data/experience";
import { education } from "@/portfolio/data/education";
import { skills } from "@/portfolio/data/skills";

/**
 * A "resume at a glance" built from the same data as the Experience/
 * Education/Skills panels (never duplicated by hand), plus the actual PDF
 * once one is provided — embedded inline when possible, always with a
 * direct download link as a fallback.
 */
export function renderResumeViewer(): HTMLElement {
  const container = el("div", "section-content resume-viewer");
  container.append(richEl("p", "section-paragraph", resumeInfo.summary));
  container.append(el("p", "resume-viewer__updated", `Last updated: ${resumeInfo.lastUpdated}`));

  const fileUrl = resumeInfo.fileUrl;
  if (!fileUrl) {
    container.append(el("p", "resume-viewer__placeholder", "A downloadable PDF isn't available yet. Here is a summary instead."));
    container.append(renderAtAGlance());
    return container;
  }

  const actions = el("div", "resume-viewer__actions");
  actions.append(externalLink("Open in New Tab ↗", fileUrl, "link-pill link-pill--primary"));
  const download = el("a", "link-pill", "Download PDF");
  download.href = fileUrl;
  download.download = "resume.pdf";
  actions.append(download);
  container.append(actions);

  // Phones and some browsers have no built-in PDF viewer, so they only get the buttons above.
  if (navigator.pdfViewerEnabled !== false) {
    const embed = el("iframe", "resume-viewer__embed");
    embed.src = `${fileUrl}#view=FitH&navpanes=0`;
    embed.title = "Resume preview";
    container.append(embed);
  } else {
    container.append(el("p", "resume-viewer__placeholder", "Your browser can't show PDFs here, so use the buttons above."));
  }
  return container;
}

function renderAtAGlance(): HTMLElement {
  const wrap = el("div", "resume-glance");
  wrap.append(el("h3", "section-subheading", "At a Glance"));

  const latestRole = experience[0];
  if (latestRole) {
    const card = el("div", "resume-glance__item");
    card.append(el("span", "resume-glance__label", "Currently"));
    card.append(
      el("span", "resume-glance__value", `${latestRole.role} · ${latestRole.organization}`),
    );
    wrap.append(card);
  }

  const latestEducation = education[0];
  if (latestEducation) {
    const card = el("div", "resume-glance__item");
    card.append(el("span", "resume-glance__label", "Education"));
    card.append(
      el("span", "resume-glance__value", `${latestEducation.credential} · ${latestEducation.institution}`),
    );
    wrap.append(card);
  }

  if (skills.length) {
    const card = el("div", "resume-glance__item");
    card.append(el("span", "resume-glance__label", "Top Skills"));
    const tags = el("div", "tag-row");
    for (const s of skills.slice(0, 2).flatMap((c) => c.skills).slice(0, 8)) {
      tags.append(el("span", "tag", s));
    }
    card.append(tags);
    wrap.append(card);
  }

  return wrap;
}
