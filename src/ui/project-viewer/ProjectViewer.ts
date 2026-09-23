import { el, externalLink } from "@/ui/utils";
import type { Project } from "@/portfolio/data/types";

/**
 * List -> detail project browser. Every field on Project is optional except
 * title/shortDescription/description/technologies, and this renderer hides
 * whatever isn't provided rather than showing empty sections. Featured
 * projects (Project.featured) surface first with a badge.
 */
export function renderProjectViewer(items: Project[]): HTMLElement {
  const container = el("div", "project-viewer");
  showList(container, items);
  return container;
}

function sortedByFeatured(items: Project[]): Project[] {
  return [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
}

function showList(container: HTMLElement, items: Project[]): void {
  container.replaceChildren();
  if (items.length === 0) {
    container.append(el("p", "section-paragraph", "Projects coming soon."));
    return;
  }

  const grid = el("div", "project-grid");
  for (const project of sortedByFeatured(items)) {
    const card = el("article", "project-card");
    if (project.featured) card.append(el("span", "project-card__badge", "★ Featured"));
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
  const titleRow = el("div", "project-detail__title-row");
  titleRow.append(el("h3", "project-detail__title", project.title));
  if (project.featured) titleRow.append(el("span", "project-card__badge", "★ Featured"));
  detail.append(titleRow);

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
      const thumb = el("button", "project-detail__thumb");
      thumb.type = "button";
      thumb.setAttribute("aria-label", `Enlarge screenshot of ${project.title}`);
      const img = el("img", "project-detail__image");
      img.src = src;
      img.alt = `${project.title} screenshot`;
      thumb.append(img);
      thumb.addEventListener("click", () => openLightbox(src, img.alt));
      gallery.append(thumb);
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

function openLightbox(src: string, alt: string): void {
  const overlay = el("div", "lightbox");
  const img = el("img", "lightbox__image");
  img.src = src;
  img.alt = alt;
  const closeButton = el("button", "lightbox__close", "✕");
  closeButton.setAttribute("aria-label", "Close image preview");

  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeydown, true);
  };
  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  // Capture phase + stopPropagation so this Escape doesn't also reach the
  // underlying Panel's own Escape listener and close the whole panel.
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener("keydown", onKeydown, true);

  overlay.append(img, closeButton);
  document.body.append(overlay);
}
