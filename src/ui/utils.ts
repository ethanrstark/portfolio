export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function externalLink(label: string, url: string, className = "link-pill"): HTMLAnchorElement {
  const a = el("a", className, label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

export const prefersReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab inside `container` while it handles key events. */
export function trapTabKey(e: KeyboardEvent, container: HTMLElement): void {
  if (e.key !== "Tab") return;
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (items.length === 0) return;
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !container.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !container.contains(active))) {
    e.preventDefault();
    first.focus();
  }
}

/** Up/Left and Down/Right move focus between `items`, like stepping through an RPG menu. */
export function moveFocusWithArrows(e: KeyboardEvent, items: HTMLElement[]): void {
  const delta = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : 0;
  if (delta === 0 || items.length === 0) return;
  e.preventDefault();
  const current = items.indexOf(document.activeElement as HTMLElement);
  items[(current + delta + items.length) % items.length]!.focus();
}

/**
 * Reveals `text` in `target` one character at a time (the RPG dialogue
 * look). Returns a function that finishes it immediately. With reduced
 * motion, or `animate` false, the text appears at once.
 */
export function typewriter(target: HTMLElement, text: string, animate = true, msPerChar = 18): () => void {
  if (!animate || prefersReducedMotion()) {
    target.textContent = text;
    return () => {};
  }
  let shown = 0;
  target.textContent = "";
  const timer = window.setInterval(() => {
    shown += 1;
    target.textContent = text.slice(0, shown);
    if (shown >= text.length) window.clearInterval(timer);
  }, msPerChar);
  return () => {
    window.clearInterval(timer);
    target.textContent = text;
  };
}
