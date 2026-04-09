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

function sameFirstAndLastStop(
  pattern1: PatternSummary,
  pattern2: PatternSummary
) {
  return (
    pattern1.lastStop === pattern2.lastStop &&
    pattern1.firstStop === pattern2.firstStop
  )
}

export function extractMainHeadsigns(
  patterns: Record<string, Pattern>,
  shortName: string,
  editToHeadsign: (pattern: PatternSummary) => void,
  editFromHeadsign: (pattern: PatternSummary) => void
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

  return mapped.reduce((amended: PatternSummary[], cur) => {
    const alreadyExistingIndex = amended.findIndex(
      (h) => h.headsign === cur.headsign
    )
    const existing = amended[alreadyExistingIndex]
    // If the headsign is a duplicate, and the last stop of the pattern is not the headsign,
    // amend the headsign with the last stop name in parenthesis.
    // e.g. "Headsign (Last Stop)"
    if (alreadyExistingIndex >= 0) {
      // If the last stop is different than the headsign but the same as the last stop
      // of the previously existing duplicate, there's no point in renaming.
      let updateHeadsign = null
      if (
        cur.lastStop &&
        cur.headsign !== cur.lastStop &&
        cur.lastStop !== existing.lastStop
      ) {
        updateHeadsign = editToHeadsign
      } else if (cur.firstStop !== existing.firstStop) {
        // Append 'from' + the first stop name if the patterns have the exact same arrival stops but different origins.
        updateHeadsign = editFromHeadsign
      }
      if (updateHeadsign) {
        // Update headsign if conditions apply.
        updateHeadsign(cur)
        // If there are only two total patterns, then we should rename both of them
        if (amended.length === 1 && mapped.length === 2) {
          updateHeadsign(amended[0])
          amended.push(cur)
          return amended
        }
      }
    }

    // With all remaining duplicate headsigns with the same first and last stops,
    // only keep the pattern with the longest geometry.
    if (alreadyExistingIndex >= 0 && sameFirstAndLastStop(existing, cur)) {
      if (existing.geometryLength < cur.geometryLength) {
        amended[alreadyExistingIndex] = cur
      }
    } else {
      amended.push(cur)
    }
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
  // Filter out patterns with no stops.
  const patternsWithStops = patterns.filter(
    (pattern) => pattern.stops?.length
  ) as PatternWithStops[]

  // Sort patterns by descending length (most stops first) for efficiency.
  const sortedPatterns = patternsWithStops.sort(
    (a, b) => b.stops.length - a.stops.length
  )

  // Compute containing patterns for each pattern (except the top-level ones)
  const containingPatterns: Record<string, string> = {}
  const immediateContainingPatterns: Record<string, string> = {}

  for (let topIndex = 0; topIndex < sortedPatterns.length - 2; topIndex++) {
    const pattern = sortedPatterns[topIndex]
    // Compare to all other patterns TODO: make this beat O(n^2)
    const patternStops = pattern.stops.map(getParentStopOrStopId)

    for (let index = topIndex + 1; index < sortedPatterns.length; index++) {
      const p = sortedPatterns[index]
      // Don't compare against ourself
      if (p.id === pattern.id) break

      // If our pattern is longer, it's not a subset
      if (patternStops.length < p.stops.length) break

      const pStops = p.stops.map(getParentStopOrStopId)
      const isSubpattern = isValidSubsequence(patternStops, pStops)
      if (isSubpattern) {
        // Populate the highest containing pattern, if not so done.
        if (
          !containingPatterns[p.id] &&
          containingPatterns[pattern.id] !== p.id // no circular references
        ) {
          containingPatterns[p.id] = pattern.id
        }
        // For immediateContainingPattern, it is the smallest containing pattern,
        // so as we iterate into sorted patterns, the patterns get smaller, so replace what was previously there.
        if (
          immediateContainingPatterns[pattern.id] !== p.id // no circular references
        ) {
          immediateContainingPatterns[p.id] = pattern.id
        }
      }
    }
  }

  // Keep patterns that are not subsets of larger patterns or, if they are,
  // have a different headsign from the containing pattern, or if the pattern and immediate coontaining pattern headsigns are not defined.
  const filteredPatterns = sortedPatterns.filter((pattern) => {
    const containingPatternId = immediateContainingPatterns[pattern.id]
    const containingPattern = patterns.find((p) => p.id === containingPatternId)
    return (
      !containingPattern ||
      !containingPattern.headsign ||
      containingPattern.headsign !== pattern.headsign
    )
  })

  return {
    containingPatterns,
    filteredPatterns
  }
}
