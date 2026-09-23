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
