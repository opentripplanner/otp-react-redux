import type { Combination } from '../components/form/batch-preferences'

/**
 * A function that generates a filter to be used to filter a list of combinations.
 *
 * TS FIXME: use the ModeOption type that is currently defined
 * in @opentripplanner/trip-form/types.ts (That type
 * needs to be moved first to @opentripplanner/types first,
 * with the defaultUnselected attribute added).
 *
 * @param enabledModesDirty A list of the modes enabled in the UI
 * @returns Filter function to filter combinations
 */
export const combinationFilter =
  (enabledModes: string[]) =>
  (c: Combination): boolean => {
    if (c.requiredModes) {
      return c.requiredModes.every((m) => enabledModes.includes(m))
    } else {
      // This is for backwards compatibility
      // In case a combination does not include requiredModes.
      console.warn(
        `Combination ${c.mode} does not have any specified required modes.`
      )
      const modesInCombination = c.mode.split(',')
      return modesInCombination.every((m) => enabledModes.includes(m))
    }
  }
