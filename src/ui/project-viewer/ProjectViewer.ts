import { el, externalLink } from "@/ui/utils";
import type { Project } from "@/portfolio/data/types";

/**
 * List -> detail project browser. Every field on Project is optional except
 * title/shortDescription/description/technologies, and this renderer hides
 * whatever isn't provided rather than showing empty sections.
 */
export function renderProjectViewer(items: Project[]): HTMLElement {
  const container = el("div", "project-viewer");
  showList(container, items);
  return container;
}

function showList(container: HTMLElement, items: Project[]): void {
  container.replaceChildren();
  if (items.length === 0) {
    container.append(el("p", "section-paragraph", "Projects coming soon."));
    return;
  }

  const grid = el("div", "project-grid");
  for (const project of items) {
    const card = el("article", "project-card");
    card.append(el("h3", "project-card__title", project.title));
    card.append(el("p", "project-card__desc", project.shortDescription));

    if (project.technologies.length) {
      const tags = el("div", "tag-row");
      for (const tech of project.technologies) tags.append(el("span", "tag", tech));
      card.append(tags);
    }

    const viewButton = el("button", "project-card__view", "View Details");
    viewButton.addEventListener("click", () => showDetail(container, project, items));
    card.append(viewButton);

    grid.append(card);
  }
  container.append(grid);
}

function showDetail(container: HTMLElement, project: Project, allItems: Project[]): void {
  container.replaceChildren();

  const backButton = el("button", "project-detail__back", "← Back to Projects");
  backButton.addEventListener("click", () => showList(container, allItems));
  container.append(backButton);

  const detail = el("div", "project-detail");
  detail.append(el("h3", "project-detail__title", project.title));
  detail.append(el("p", "section-paragraph", project.description));

  if (project.technologies.length) {
    const tags = el("div", "tag-row");
    for (const tech of project.technologies) tags.append(el("span", "tag", tech));
    detail.append(tags);
  }

  const links = project.links;
  if (links?.github || links?.demo || links?.website) {
    const linkRow = el("div", "project-detail__links");
    if (links.github) linkRow.append(externalLink("GitHub ↗", links.github));
    if (links.demo) linkRow.append(externalLink("Live Demo ↗", links.demo));
    if (links.website) linkRow.append(externalLink("Website ↗", links.website));
    detail.append(linkRow);
  }

  if (project.media?.images?.length) {
    const gallery = el("div", "project-detail__gallery");
    for (const src of project.media.images) {
      const img = el("img", "project-detail__image");
      img.src = src;
      img.alt = `${project.title} screenshot`;
      gallery.append(img);
    }
    detail.append(gallery);
  }

  if (project.media?.video) {
    const video = el("video", "project-detail__video");
    video.src = project.media.video;
    video.controls = true;
    detail.append(video);
  }

  container.append(detail);
}
