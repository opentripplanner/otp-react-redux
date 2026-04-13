import { Route, Stop } from '@opentripplanner/types'

import '../test-utils/mock-window-url'
import {
  extractMainHeadsigns,
  PatternSummary,
  sortAndRemoveSubpatterns
} from '../../lib/util/pattern-viewer'
import { Pattern } from '../../lib/components/util/types'

function createStops(ids: string[]): Stop[] {
  return ids.map((id) => ({
    gtfsId: id,
    id,
    name: id
  }))
}

function editToHeadsign(pattern: PatternSummary): string {
  return `${pattern.headsign} (${pattern.lastStop})`
}

function editFromHeadsign(pattern: PatternSummary): string {
  return `${pattern.headsign} (from ${pattern.firstStop})`
}

const defaultHeadsign = 'Everett via Lynnwood'
const route: Route = {
  agency: {
    id: 'agnecy'
  },
  id: 'route-id',
  shortName: '512',
  sortOrder: 0,
  sortOrderSet: false
}

function createPattern(
  id: string,
  length: number,
  stops: string[],
  headsign: string | null = defaultHeadsign
): Pattern {
  return {
    desc: `${id} Pattern name`,
    headsign,
    id,
    patternGeometry: {
      length,
      points: `${id}-points`
    },
    route,
    stops: createStops(stops)
  }
}

describe('util > pattern-viewer', () => {
  describe('extractMainHeadsigns', () => {
    it('should retain the essential patterns', () => {
      // Consider the following patterns P1, P2, P3 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--o--o
      // P2:         o--o-----o--o
      // P3:   o-----o--o--o
      // P4:   o--o--o--o
      // P5:   o--o--o
      //
      // P3 should be removed because it has the same origin and final stops as P1.
      // P4 and P5 have a different headsign and should be kept.
      // P1, P2, P4, and P5 should be kept.
      // Patterns are assumed in descending length order because
      // pre-sorting happened before extractMainHeadsigns is invoked (key order matters).
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S4', 'S5']),
        P2: createPattern('P2', 1072, ['S3', 'S4', 'S6', 'S7']),
        P3: createPattern('P3', 987, ['S1', 'S3', 'S4', 'S5']),
        P4: createPattern(
          'P4',
          1100,
          ['S1', 'S2', 'S3', 'S4'],
          'Other headsign'
        ),
        P5: createPattern('P5', 900, ['S1', 'S2', 'S3', 'S4'], null)
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editToHeadsign,
        editFromHeadsign
      )
      expect(headsignData.length).toBe(4)
      expect(headsignData[0].headsign).toBe(defaultHeadsign)
      expect(headsignData[1].headsign).toBe(`${defaultHeadsign} (S7)`)
      expect(headsignData[2].headsign).toBe('Other headsign')
      expect(headsignData[3].headsign).toBe('P5 Pattern name')
    })
    it('should keep forks with the same headsigns', () => {
      // Consider the following patterns P1, P2, P3 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--------o--o
      // P2:            o--o--o--o
      // P3:   o--------------o--o
      //
      // P3 should be removed because it has the same origin and final stops as P1.
      // P1 and P2 should be kept.
      // Patterns are assumed in descending length order because
      // pre-sorting happened before extractMainHeadsigns is invoked (key order matters).
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S6', 'S7'], 'S7'),
        P2: createPattern('P2', 1072, ['S4', 'S5', 'S6', 'S7'], 'S7'),
        P3: createPattern('P3', 987, ['S1', 'S6', 'S7'], 'S7')
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editToHeadsign,
        editFromHeadsign
      )
      expect(headsignData.length).toBe(2)
      expect(headsignData[0].headsign).toBe('S7')
      expect(headsignData[1].headsign).toBe('S7 (from S4)')
    })
    it('should append final stops', () => {
      // Consider the following patterns P1, P2 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--------o--o
      // P2:            o--o--o
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S6', 'S7']),
        P2: createPattern('P2', 1072, ['S4', 'S5', 'S6'])
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editToHeadsign,
        editFromHeadsign
      )
      expect(headsignData.length).toBe(2)
      // The final stop is appended because there are only two patterns.
      expect(headsignData[0].headsign).toBe(`${defaultHeadsign} (S7)`)
      expect(headsignData[1].headsign).toBe(`${defaultHeadsign} (S6)`)
    })
    it('should prepend origin stops', () => {
      // Consider the following patterns P1, P2 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--------o--o
      // P2:               o--o--o
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S6', 'S7']),
        P2: createPattern('P1', 1072, ['S5', 'S6', 'S7'])
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editToHeadsign,
        editFromHeadsign
      )
      expect(headsignData.length).toBe(2)
      // The origin stop is appended because there are only two patterns.
      expect(headsignData[0].headsign).toBe(`${defaultHeadsign} (from S1)`)
      expect(headsignData[1].headsign).toBe(`${defaultHeadsign} (from S5)`)
    })
  })

  describe('sortAndRemoveSubpatterns', () => {
    it('should sort and remove subpatterns', () => {
      // Consider the following patterns of the same route:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--o--o
      // P2:         o--o-----o--o
      // P3:         o--o--o
      // P4:   o-----o--o--o
      // P5:   o--o--o--o--o
      // P6:               o--o--o
      // P7:   o--o--o
      // P8:      o--o
      // P9:   o--o
      // P10: <undefined stops>
      //
      // One of P1 or P5 should be removed because both have the exact same stops.
      // P3 should be removed because it is a subset of P1, P4, and P5.
      // P7, P8, and P9 have different headsigns than P1. P8 and P7 have different headsigns.
      // P1, P2, P4, P6, P7, P8, P9 should be kept.
      const patterns: Pattern[] = [
        createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S4', 'S5']),
        createPattern('P2', 1072, ['S3', 'S4', 'S6', 'S7']),
        createPattern('P3', 987, ['S3', 'S4', 'S5']),
        createPattern('P4', 1404, ['S1', 'S3', 'S4', 'S5']),
        createPattern('P5', 1404, ['S1', 'S2', 'S3', 'S4', 'S5']),
        createPattern('P6', 700, ['S5', 'S6', 'S7']),
        createPattern('P7', 600, ['S1', 'S2', 'S3'], null),
        createPattern('P8', 500, ['S2', 'S3'], 'Other headsign'),
        createPattern('P9', 400, ['S1', 'S2'], null),
        {
          desc: 'Pattern without stops',
          headsign: defaultHeadsign,
          id: 'P10',
          patternGeometry: {
            length: 0,
            points: ''
          },
          route,
          stops: undefined
        }
      ]
      const { containingPatterns, filteredPatterns } =
        sortAndRemoveSubpatterns(patterns)
      expect(filteredPatterns).toEqual([
        patterns[0],
        patterns[1],
        patterns[3],
        patterns[5],
        patterns[6],
        patterns[7],
        patterns[8]
      ])
      expect(containingPatterns.P3).toBe('P1')
      expect(containingPatterns.P4).toBeUndefined()
      // No circular references in identical patterns
      expect(containingPatterns.P5).toBe('P1')
      expect(containingPatterns.P1).toBeUndefined()
    })
    it('should not create circular references', () => {
      // Consider the following patterns of the same route:
      // Stops S1 S2 S3 S4 S5 --> direction of travel
      // P1:   o--o--o--o--o
      // P2:   o--o--o--o--o
      // P3:   o--o--o--o--o
      //
      const patterns: Pattern[] = [
        createPattern('P1', 1404, ['S1', 'S2', 'S3', 'S4', 'S5']),
        createPattern('P2', 1404, ['S1', 'S2', 'S3', 'S4', 'S5']),
        createPattern('P3', 1404, ['S1', 'S2', 'S3', 'S4', 'S5'])
      ]
      const { containingPatterns, filteredPatterns } =
        sortAndRemoveSubpatterns(patterns)
      expect(filteredPatterns.length).toBe(1)
      expect(filteredPatterns).toContain(patterns[0])
      expect(containingPatterns.P2).toBe('P1')
      expect(containingPatterns.P3).toBe('P1')
    })
  })
})
