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

// --- inline text styling -----------------------------------------------------

/** `**bold**`, `*emphasis*`, `` `code` ``, `[label](url)` and backslash escapes such as `\*`. */
const INLINE = /\\([*`[\]\\])|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Only these kinds of address become links; anything else (such as `javascript:`) stays plain text. */
const SAFE_LINK = /^(https?:\/\/|mailto:|#|\/)/i;

/**
 * Turns text written with the inline styling above into DOM nodes. Content
 * is only ever added as text or as these few elements, never as HTML, so
 * stray `<` characters in your content are shown as they are.
 */
export function richText(text: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const [whole, escaped, bold, italic, code, label, url] = match;
    if (match.index > last) fragment.append(text.slice(last, match.index));
    if (escaped !== undefined) fragment.append(escaped);
    else if (bold !== undefined) fragment.append(el("strong", undefined, bold));
    else if (italic !== undefined) fragment.append(el("em", undefined, italic));
    else if (code !== undefined) fragment.append(el("code", undefined, code));
    else if (label !== undefined && url !== undefined) {
      if (SAFE_LINK.test(url)) {
        const link = el("a", "inline-link", label);
        link.href = url;
        if (/^https?:/i.test(url)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        fragment.append(link);
      } else {
        fragment.append(whole);
      }
    }
    last = match.index + whole.length;
  }
  if (last < text.length) fragment.append(text.slice(last));
  return fragment;
}

/** Like `el`, but the text may use the inline styling that `richText` understands. */
export function richEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string | undefined,
  text: string,
): HTMLElementTagNameMap[K] {
  const node = el(tag, className);
  node.append(richText(text));
  return node;
}

/**
 * Reveals `text` in `target` one character at a time (the RPG dialogue
 * look), styling included. Returns a function that finishes it immediately.
 * With reduced motion, or `animate` false, the text appears at once.
 */
export function typewriter(target: HTMLElement, text: string, animate = true, msPerChar = 18): () => void {
  target.replaceChildren(richText(text));
  if (!animate || prefersReducedMotion()) return () => {};

  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const pieces: { node: Text; full: string }[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    pieces.push({ node: node as Text, full: node.textContent ?? "" });
  }
  const total = pieces.reduce((sum, piece) => sum + piece.full.length, 0);
  pieces.forEach((piece) => (piece.node.textContent = ""));

  let shown = 0;
  const reveal = (count: number) => {
    let remaining = count;
    for (const piece of pieces) {
      piece.node.textContent = piece.full.slice(0, Math.max(0, remaining));
      remaining -= piece.full.length;
    }
  };
  const timer = window.setInterval(() => {
    shown += 1;
    reveal(shown);
    if (shown >= total) window.clearInterval(timer);
  }, msPerChar);
  return () => {
    window.clearInterval(timer);
    reveal(total);
  };
}
