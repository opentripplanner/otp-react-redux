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

function editHeadsign(pattern: PatternSummary) {
  pattern.headsign = `${pattern.headsign} (${pattern.lastStop})`
}

const headsign = 'Everett via Lynnwood'
const route: Route = {
  agency: {
    id: 'agnecy'
  },
  id: 'route-id',
  shortName: '512',
  sortOrder: 0,
  sortOrderSet: false
}

describe('util > pattern-viewer', () => {
  describe('extractMainHeadsigns', () => {
    it('should retain the essential patterns', () => {
      // Consider the following patterns P1, P2, P3 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--o--o
      // P2:         o--o-----o--o
      // P3:   o-----o--o--o
      //
      // P3 should be removed because it has the same origin and final stops as P1.
      // P1 and P2 should be kept.
      // Patterns are assumed in descending length order because
      // pre-sorting happened before extractMainHeadsigns is invoked (key order matters).
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: {
          desc: 'P1 Pattern name',
          headsign,
          id: 'P1',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S4', 'S5'])
        },
        P2: {
          desc: 'P2 Pattern name',
          headsign,
          id: 'P2',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          route,
          stops: createStops(['S3', 'S4', 'S6', 'S7'])
        },
        P3: {
          desc: 'P3 Pattern name',
          headsign,
          id: 'P3',
          patternGeometry: {
            length: 987,
            points: 'p3-points'
          },
          route,
          stops: createStops(['S1', 'S3', 'S4', 'S5'])
        }
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editHeadsign
      )
      expect(headsignData.length).toBe(2)
      expect(headsignData[0].headsign).toBe(headsign)
      expect(headsignData[1].headsign).toBe(`${headsign} (S7)`)
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
        P1: {
          desc: 'P1 Pattern name',
          headsign: 'S7',
          id: 'P1',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S6', 'S7'])
        },
        P2: {
          desc: 'P2 Pattern name',
          headsign: 'S7',
          id: 'P2',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          route,
          stops: createStops(['S4', 'S5', 'S6', 'S7'])
        },
        P3: {
          desc: 'P3 Pattern name',
          headsign: 'S7',
          id: 'P3',
          patternGeometry: {
            length: 987,
            points: 'p3-points'
          },
          route,
          stops: createStops(['S1', 'S6', 'S7'])
        }
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editHeadsign
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
        P1: {
          desc: 'P1 Pattern name',
          headsign,
          id: 'P1',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S6', 'S7'])
        },
        P2: {
          desc: 'P2 Pattern name',
          headsign,
          id: 'P2',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          route,
          stops: createStops(['S4', 'S5', 'S6'])
        }
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editHeadsign
      )
      expect(headsignData.length).toBe(2)
      // The final stop is appended because there are only two patterns.
      expect(headsignData[0].headsign).toBe(`${headsign} (S7)`)
      expect(headsignData[1].headsign).toBe(`${headsign} (S6)`)
    })
    it('should prepend origin stops', () => {
      // Consider the following patterns P1, P2 of the same route with the same headsigns:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--------o--o
      // P2:               o--o--o
      const routeShortName = '512'
      const patterns: Record<string, Pattern> = {
        P1: {
          desc: 'P1 Pattern name',
          headsign,
          id: 'P1',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S6', 'S7'])
        },
        P2: {
          desc: 'P2 Pattern name',
          headsign,
          id: 'P2',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          route,
          stops: createStops(['S5', 'S6', 'S7'])
        }
      }
      const headsignData = extractMainHeadsigns(
        patterns,
        routeShortName,
        editHeadsign
      )
      expect(headsignData.length).toBe(2)
      // The final stop is appended because there are only two patterns.
      expect(headsignData[0].headsign).toBe(`${headsign} (from S1)`)
      expect(headsignData[1].headsign).toBe(`${headsign} (from S5)`)
    })
  })

  describe('sortAndRemoveSubpatterns', () => {
    it('should sort and remove subpatterns', () => {
      // Consider the following patterns P1...P6 of the same route:
      // Stops S1 S2 S3 S4 S5 S6 S7 --> direction of travel
      // P1:   o--o--o--o--o
      // P2:         o--o-----o--o
      // P3:         o--o--o
      // P4:   o-----o--o--o
      // P5:   o--o--o--o--o
      // P6:               o--o--o
      // P7: <undefined stops>
      //
      // One of P1 or P5 should be removed because both have the exact same stops.
      // P3 should be removed because it is a subset of P1, P4, and P5.
      // P1, P2, P4, and P6 should be kept.
      const patterns: Pattern[] = [
        {
          desc: 'P1 Pattern name',
          headsign,
          id: 'P1',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S4', 'S5'])
        },
        {
          desc: 'P2 Pattern name',
          headsign,
          id: 'P2',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          route,
          stops: createStops(['S3', 'S4', 'S6', 'S7'])
        },
        {
          desc: 'P3 Pattern name',
          headsign,
          id: 'P3',
          patternGeometry: {
            length: 987,
            points: 'p3-points'
          },
          route,
          stops: createStops(['S3', 'S4', 'S5'])
        },
        {
          desc: 'P4 Pattern name',
          headsign,
          id: 'P4',
          patternGeometry: {
            length: 1404,
            points: 'p4-points'
          },
          route,
          stops: createStops(['S1', 'S3', 'S4', 'S5'])
        },
        {
          desc: 'P5 Pattern name (same stops as P1)',
          headsign,
          id: 'P5',
          patternGeometry: {
            length: 1404,
            points: 'p5-points'
          },
          route,
          stops: createStops(['S1', 'S2', 'S3', 'S4', 'S5'])
        },
        {
          desc: 'P6 Pattern name',
          headsign,
          id: 'P6',
          patternGeometry: {
            length: 700,
            points: 'p6-points'
          },
          route,
          stops: createStops(['S5', 'S6', 'S7'])
        },
        {
          desc: 'Pattern without stops',
          headsign,
          id: 'P7',
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
      expect(filteredPatterns.length).toBe(4)
      expect(filteredPatterns).toContain(patterns[0])
      expect(filteredPatterns).toContain(patterns[1])
      expect(filteredPatterns).toContain(patterns[3])
      expect(filteredPatterns).toContain(patterns[5])
      expect(containingPatterns.P3).toBe('P1')
      expect(containingPatterns.P4).toBe(undefined)
      // No circular references in identical patterns
      expect(containingPatterns.P5).toBe('P1')
      expect(containingPatterns.P1).toBeUndefined()
    })
  })
})
