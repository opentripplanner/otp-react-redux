/**
 * Identifies whether the user's machine has "reduced motion" enabled
 *  in their local settings. If reduced motion is on, the app should
 * show as few animations & transitions as possible.
 * @returns boolean reflecting whether user prefers reduced motion
 */
export const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches
