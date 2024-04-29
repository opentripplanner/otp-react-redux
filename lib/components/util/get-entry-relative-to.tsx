/**
 * Helper method to find the element within the app menu at the given offset
 * (e.g. previous or next) relative to the specified element.
 *
 * @param {string} query  - Argument that gets passed to document.querySelectorAll
 * @param {HTMLElement} element - Specified element (e.target)
 * @param {1 | -1} offset - Determines direction to move within array of focusable elements (previous or next)
 * @returns {HTMLElement} - element to be focused
 */

export function getEntryRelativeTo(
  query: string,
  element: EventTarget,
  offset: 1 | -1
): HTMLElement {
  const entries = Array.from(document.querySelectorAll(query))
  const firstElement = entries[0]
  const lastElement = entries[entries.length - 1]
  const elementIndex = entries.indexOf(element as HTMLButtonElement)

  if (element === firstElement && offset === -1) {
    return lastElement as HTMLElement
  }
  if (element === lastElement && offset === 1) {
    return firstElement as HTMLElement
  }
  return entries[elementIndex + offset] as HTMLElement
}
