import { Stop } from '@opentripplanner/types'

import { Pattern } from '../components/util/types'

import { extractHeadsignFromPattern } from './viewer'
import { isValidSubsequence } from './state'

export interface PatternSummary {
  firstStop?: string
  geometryLength: number
  headsign: string
  id: string
  lastStop?: string
}

export interface SubPatternInfo {
  containingPatterns: Record<string, string>
  filteredPatterns: Pattern[]
}

export interface StopWithParent extends Stop {
  parentStation?: Stop
}

interface PatternWithStops extends Pattern {
  stops: Stop[]
}

export function extractMainHeadsigns(
  patterns: Record<string, Pattern>,
  shortName: string,
  editHeadsign: (pattern: PatternSummary) => void
): PatternSummary[] {
  const mapped = Object.entries(patterns).map(
    ([id, pat]): PatternSummary => ({
      firstStop: pat.stops?.[0]?.name,
      geometryLength: pat.patternGeometry?.length || 0,
      headsign: extractHeadsignFromPattern(pat, shortName),
      id,
      lastStop: pat.stops?.[pat.stops?.length - 1]?.name
    })
  )

  // Address duplicate headsigns.
  // Either append the last stop name, or append 'from' + the first stop name.
  return mapped.reduce((prev: PatternSummary[], cur) => {
    const amended = prev
    const alreadyExistingIndex = prev.findIndex(
      (h) => h.headsign === cur.headsign
    )
    // If the headsign is a duplicate, and the last stop of the pattern is not the headsign,
    // amend the headsign with the last stop name in parenthesis.
    // e.g. "Headsign (Last Stop)"
    if (alreadyExistingIndex >= 0) {
      if (cur.lastStop && cur.headsign !== cur.lastStop) {
        // If the last stop is different than the headsign but the same as the last stop of the previously existing duplicate, there's no point in renaming.
        if (cur.lastStop !== amended[alreadyExistingIndex].lastStop) {
          editHeadsign(cur)
        } else if (cur.firstStop !== amended[alreadyExistingIndex].firstStop) {
          cur.headsign = cur.headsign + ` (from ${cur.firstStop})`
        }

        // If there are only two total patterns, then we should rename
        // both of them
        if (amended.length === 1 && Object.entries(patterns).length === 2) {
          editHeadsign(amended[0])
          amended.push(cur)
          return amended
        }
      }
    }

    // With all remaining duplicate headsigns with the same last stops, only keep the pattern with the
    // longest geometry.
    if (
      alreadyExistingIndex >= 0 &&
      amended[alreadyExistingIndex].lastStop === cur.lastStop &&
      amended[alreadyExistingIndex].firstStop === cur.firstStop
    ) {
      if (amended[alreadyExistingIndex].geometryLength < cur.geometryLength) {
        amended[alreadyExistingIndex] = cur
      }
    } else {
      amended.push(cur)
    }
    console.log('Amended', amended.length)
    return amended
  }, [])
}

/**
 * Obtains the parent stop id, if available, or the stop id.
 */
export function getParentStopOrStopId(stop: StopWithParent): string {
  return stop.parentStation?.id || stop.id
}

/**
 * Computes a list of patterns, in descending length order, in which none is a subpattern of any other.
 * In the patterns below, only Patterns 1, 2, 5 should be retained.
 * In addition, Pattern 1 is designated as containing pattern for Pattern 3.
 * The containing pattern for Pattern 4 could be Pattern 1 or 2,
 * however whichever is actually picked does not really matter.
 *   Pattern 1: Stops A, B, C, D
 *   Pattern 2: Stops    B, C, D, E, F
 *   Pattern 3: Stops A, B, C
 *   Pattern 4: Stops       C, D, E
 *   Pattern 5: Stops A,    C, D, E
 * @returns An object with a filteredPatterns field with the filtered (largest) patterns,
 *   and a containingPatterns field with a map of the containing pattern for each pattern.
 */
export function sortAndRemoveSubpatterns(patterns: Pattern[]): SubPatternInfo {
  const containingPatterns: Record<string, string> = {}

  // Filter out patterns with no stops.
  const patternsWithStops = patterns.filter(
    (pattern) => pattern.stops?.length
  ) as PatternWithStops[]

  // Keep patterns that are not subsets of larger patterns.
  // Assign a containing pattern to each sub pattern.
  const filteredPatterns = patternsWithStops
    // Sort patterns by descending length (most stops first) for efficiency.
    .sort((a, b) => b.stops.length - a.stops.length)
    .filter((pattern, patternIndex) => {
      // Compare to all other patterns TODO: make this beat O(n^2)
      let includePattern = true
      const patternStops = pattern.stops.map(getParentStopOrStopId) || []

      patternsWithStops.forEach((p, index) => {
        // Don't compare against ourself
        if (p.id === pattern.id) return

        // If our pattern is longer, it's not a subset
        if (p.stops.length < patternStops.length) return

        const pStops = p.stops.map(getParentStopOrStopId)
        const isSubpattern = isValidSubsequence(pStops, patternStops)
        if (isSubpattern) {
          // Include pattern if it has not been referenced before among patterns of same stops.
          includePattern = index > patternIndex
          // Populate the highest containing pattern.
          if (!containingPatterns[pattern.id]) {
            containingPatterns[pattern.id] = p.id
          }
        }
      })

      return includePattern
    })

  return {
    containingPatterns,
    // Fallback for if the filtering leaves us with a silly number of patterns
    // If this happens, it is not possible to know which pattern to keep.
    filteredPatterns: filteredPatterns.length > 1 ? filteredPatterns : patterns
  }
}
