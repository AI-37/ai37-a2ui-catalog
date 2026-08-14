/** Скролл к элементу; в средах без scrollIntoView (jsdom) — no-op. */
export function scrollToElement(element: HTMLElement | null): void {
  element?.scrollIntoView?.({behavior: 'smooth', block: 'nearest'});
}
