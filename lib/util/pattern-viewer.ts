import { Pattern } from '../components/util/types'

import { extractHeadsignFromPattern } from './viewer'
import { isValidSubsequence } from './state'

export interface PatternSummary {
  geometryLength: number
  headsign: string
  id: string
  lastStop?: string
}

export interface SubPatternInfo {
  filteredPatterns: Pattern[]
  subPatterns: Record<string, string[]>
}

export function extractMainHeadsigns(
  patterns: Record<string, Pattern>,
  shortName: string,
  editHeadsign: (pattern: PatternSummary) => void
): PatternSummary[] {
  const mapped = Object.entries(patterns).map(
    ([id, pat]): PatternSummary => ({
      geometryLength: pat.patternGeometry?.length || 0,
      headsign: extractHeadsignFromPattern(pat, shortName),
      id,
      lastStop: pat.stops?.[pat.stops?.length - 1]?.name
    })
  )

  // Address duplicate headsigns.
  return mapped.reduce((prev: PatternSummary[], cur) => {
    const amended = prev
    const alreadyExistingIndex = prev.findIndex(
      (h) => h.headsign === cur.headsign
    )
    // If the headsign is a duplicate, and the last stop of the pattern is not the headsign,
    // amend the headsign with the last stop name in parenthesis.
    // e.g. "Headsign (Last Stop)"
    if (
      alreadyExistingIndex >= 0 &&
      cur.lastStop &&
      cur.headsign !== cur.lastStop &&
      // If the last stop is different than the headsign but the same as the last stop of the previously existing duplicate, there's no point in renaming.
      cur.lastStop !== amended[alreadyExistingIndex].lastStop
    ) {
      editHeadsign(cur)

      // If there are only two total patterns, then we should rename
      // both of them
      if (amended.length === 1 && Object.entries(patterns).length === 2) {
        editHeadsign(amended[0])
        amended.push(cur)
        return amended
      }
    }

    // With all remaining duplicate headsigns with the same last stops, only keep the pattern with the
    // longest geometry.
    if (
      alreadyExistingIndex >= 0 &&
      amended[alreadyExistingIndex].lastStop === cur.lastStop
    ) {
      if (amended[alreadyExistingIndex].geometryLength < cur.geometryLength) {
        amended[alreadyExistingIndex] = cur
      }
    } else {
      amended.push(cur)
    }
    return amended
  }, [])
}

/**
 * Returns a list of patterns, in descending length order, in which none is a subpattern of any other.
 * In the patterns below, only Patterns 1, 2, 5 should be retained:
 *   Pattern 1: Stops A, B, C, D
 *   Pattern 2: Stops    B, C, D, E, F
 *   Pattern 3: Stops A, B, C
 *   Pattern 4: Stops       C, D, E
 *   Pattern 5: Stops A,    C, D, E
 */
export function sortAndRemoveSubpatterns(patterns: Pattern[]): SubPatternInfo {
  // Sort patterns by length to make algorithm below more efficient
  const patternsSortedByLength = [...patterns].sort(
    (a, b) => (a.stops?.length || 0) - (b.stops?.length || 0)
  )

  const subPatterns: Record<string, string[]> = {}

  // Remove all patterns that are subsets of larger patterns
  const filteredPatterns = patternsSortedByLength
    // Start with the largest for performance
    .reverse()
    .filter((pattern) => {
      // Compare to all other patterns TODO: make this beat O(n^2)
      return !patternsSortedByLength.find((p) => {
        // Don't compare against ourself
        if (p.id === pattern.id) return false

        // If the pattern has no stops, exclude it.
        if (!p.stops || p.stops.length === 0) return false

        // If our pattern is longer, it's not a subset
        if ((p.stops?.length || 0) <= (pattern.stops?.length || 0)) return false

        const isSubpattern = isValidSubsequence(
          p.stops?.map((s) => s.id) || [],
          pattern.stops?.map((s) => s.id) || []
        )

        if (isSubpattern) {
          // Populate a list of subpatterns for the larger pattern.
          if (!subPatterns[p.id]) {
            subPatterns[p.id] = []
          }
          subPatterns[p.id].push(pattern.id)
        }

        return isSubpattern
      })
    })

  return {
    // Fallback for if the filtering leaves us with a silly number of patterns
    // If this happens, it is not possible to know which pattern to keep.
    filteredPatterns: filteredPatterns.length > 1 ? filteredPatterns : patterns,
    subPatterns
  }
}
