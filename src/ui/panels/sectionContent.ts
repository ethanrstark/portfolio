import { el, richEl } from "@/ui/utils";
import { aboutInfo } from "@/portfolio/data/about";
import { education } from "@/portfolio/data/education";
import { experience } from "@/portfolio/data/experience";
import { skills } from "@/portfolio/data/skills";
import { links } from "@/portfolio/data/links";
import type { LinkEntry } from "@/portfolio/data/types";

const linkIconFiles = import.meta.glob("/src/assets/ui/icons/*.{svg,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Logos that keep their own colours; every other icon is drawn in the surrounding text colour. */
const FULL_COLOUR_ICONS: LinkEntry["kind"][] = ["linkedin"];

/**
 * The icon for a link kind, from src/assets/ui/icons/<kind>.svg (or .png).
 * A kind without a file falls back to other.svg, then to a plain arrow. Single-colour icons are used
 * as a mask, so they follow the text colour and stay visible on both the dark
 * buttons and the light cards.
 */
export function linkIcon(kind: LinkEntry["kind"]): HTMLElement {
  const find = (name: string) =>
    Object.entries(linkIconFiles).find(([path]) => path.split("/").pop()?.replace(/\.\w+$/, "") === name)?.[1];
  const url = find(kind) ?? find("other");

  // No icon file at all (not even other.svg): a plain arrow keeps the button visible.
  if (!url) return el("span", "link-icon-fallback", "↗");
  if (FULL_COLOUR_ICONS.includes(kind)) {
    const image = el("img", "link-icon link-icon--colour");
    image.src = url;
    image.alt = "";
    return image;
  }
  const icon = el("span", "link-icon");
  icon.style.setProperty("--icon", `url("${url}")`);
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function renderAbout(): HTMLElement {
  const container = el("div", "section-content");

  const header = el("div", "about-header");
  header.append(el("div", "about-header__avatar", initials(aboutInfo.name)));
  const headerText = el("div", "about-header__text");
  headerText.append(
    el("h3", "about-header__name", aboutInfo.name),
    richEl("p", "section-tagline", aboutInfo.tagline),
  );
  header.append(headerText);
  container.append(header);

  for (const paragraph of aboutInfo.bio) {
    container.append(richEl("p", "section-paragraph", paragraph));
  }

  if (aboutInfo.funFacts?.length) {
    container.append(el("h3", "section-subheading", "Fun Facts"));
    const list = el("ul", "bullet-list");
    for (const fact of aboutInfo.funFacts) list.append(richEl("li", undefined, fact));
    container.append(list);
  }
  return container;
}

export function renderEducation(): HTMLElement {
  const container = el("div", "section-content");
  for (const entry of education) {
    const card = el("article", "entry-card");
    card.append(el("h3", "entry-card__title", entry.credential));
    card.append(el("p", "entry-card__meta", `${entry.institution} · ${entry.startDate}–${entry.endDate}`));
    if (entry.description) card.append(richEl("p", "section-paragraph", entry.description));
    if (entry.highlights?.length) {
      const list = el("ul", "bullet-list");
      for (const h of entry.highlights) list.append(richEl("li", undefined, h));
      card.append(list);
    }
    container.append(card);
  }
  return container;
}

export function renderExperience(): HTMLElement {
  const container = el("div", "section-content");
  for (const entry of experience) {
    const card = el("article", "entry-card");
    card.append(el("h3", "entry-card__title", entry.role));
    const metaParts = [entry.organization, `${entry.startDate}–${entry.endDate}`, entry.location]
      .filter(Boolean)
      .join(" · ");
    card.append(el("p", "entry-card__meta", metaParts));
    card.append(richEl("p", "section-paragraph", entry.summary));
    if (entry.highlights?.length) {
      const list = el("ul", "bullet-list");
      for (const h of entry.highlights) list.append(richEl("li", undefined, h));
      card.append(list);
    }
    if (entry.technologies?.length) {
      const tags = el("div", "tag-row");
      for (const tech of entry.technologies) tags.append(el("span", "tag", tech));
      card.append(tags);
    }
    container.append(card);
  }
  return container;
}

export function renderSkills(): HTMLElement {
  const container = el("div", "section-content skills-grid");
  for (const category of skills) {
    const card = el("article", "entry-card");
    card.append(el("h3", "entry-card__title", category.name));
    const tags = el("div", "tag-row");
    for (const skill of category.skills) tags.append(el("span", "tag", skill));
    card.append(tags);
    container.append(card);
  }
  return container;
}

export function renderLinks(): HTMLElement {
  const container = el("div", "section-content");
  container.append(el("p", "section-paragraph", "The best ways to reach me or see more of my work."));
  const list = el("div", "links-list");
  for (const link of links) {
    const row = el("div", "links-list__item");
    const anchor = el("a", "links-list__item-link");
    anchor.href = link.url;
    if (link.kind !== "email") {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    anchor.append(linkIcon(link.kind), el("span", "links-list__label", link.label));
    row.append(anchor);

    if (link.kind === "email") {
      const copyButton = el("button", "links-list__copy", "Copy");
      copyButton.type = "button";
      copyButton.addEventListener("click", async () => {
        const email = link.url.replace(/^mailto:/, "");
        try {
          await navigator.clipboard.writeText(email);
          copyButton.textContent = "Copied!";
        } catch {
          copyButton.textContent = "Copy failed";
        }
        window.setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1500);
      });
      row.append(copyButton);
    }

    list.append(row);
  }
  container.append(list);
  return container;
}

/** The placeholder shown for a section that is still being written (see SectionMeta.comingSoon). */
export function renderComingSoon(message: string): HTMLElement {
  const container = el("div", "section-content coming-soon");
  container.append(el("div", "coming-soon__icon", "🚧"));
  container.append(el("h3", "coming-soon__title", "Under Construction"));
  container.append(richEl("p", "coming-soon__message", message));
  return container;
}
