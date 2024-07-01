import { Pattern } from '../components/util/types'

import { extractHeadsignFromPattern } from './viewer'

export interface PatternSummary {
  geometryLength: number
  headsign: string
  id: string
  lastStop?: string
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
      cur.headsign !== cur.lastStop
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
