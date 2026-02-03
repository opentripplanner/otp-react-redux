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
      // P3:         o--o--o
      //
      // P3 should be removed because it is a subset of P1.
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
          stops: createStops(['S3', 'S4', 'S5'])
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
      // P6: <undefined stops>
      // P7:         o--o--o
      //
      // One of P1 or P5 should be removed because both have the exact same stops.
      // P3 and P7 should be removed because they are a subset of P1, P4, and P5.
      // P1, P2, and P4 should be kept.
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
          desc: 'Pattern without stops',
          headsign,
          id: 'P6',
          patternGeometry: {
            length: 0,
            points: ''
          },
          route,
          stops: undefined
        },
        {
          desc: 'P7 Pattern name',
          headsign,
          id: 'P7',
          patternGeometry: {
            length: 987,
            points: 'p7-points'
          },
          route,
          stops: createStops(['S3', 'S4', 'S5'])
        }
      ]
      const { containingPatterns, filteredPatterns } =
        sortAndRemoveSubpatterns(patterns)
      expect(filteredPatterns.length).toBe(3)
      expect(['P1', 'P5']).toContain(filteredPatterns[0].id)
      expect(filteredPatterns[1]).toBe(patterns[3])
      expect(filteredPatterns[2]).toBe(patterns[1])
      expect(['P1', 'P5']).toContain(containingPatterns.P3)
      expect(containingPatterns.P4).toBe(undefined)
      expect(
        containingPatterns.P1 === 'P5' || containingPatterns.P5 === 'P1'
      ).toBeTruthy()
    })
  })
})
