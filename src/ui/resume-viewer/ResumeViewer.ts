import { el, externalLink } from "@/ui/utils";
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
  container.append(el("p", "section-paragraph", resumeInfo.summary));
  container.append(el("p", "resume-viewer__updated", `Last updated: ${resumeInfo.lastUpdated}`));

  if (resumeInfo.fileUrl) {
    const actions = el("div", "resume-viewer__actions");
    actions.append(externalLink("Download Resume (PDF) ↗", resumeInfo.fileUrl, "link-pill link-pill--primary"));
    container.append(actions);

    const embed = el("iframe", "resume-viewer__embed");
    embed.src = resumeInfo.fileUrl;
    embed.title = "Resume preview";
    container.append(embed);
  } else {
    container.append(el("p", "resume-viewer__placeholder", "[Placeholder] A downloadable PDF will be linked here."));
    container.append(renderAtAGlance());
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
