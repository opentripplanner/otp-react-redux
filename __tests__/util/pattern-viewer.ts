import '../test-utils/mock-window-url'
import { extractMainHeadsigns } from '../../lib/util/pattern-viewer'

function createStops(ids) {
  return ids.map((id) => ({
    id,
    name: id
  }))
}

function editHeadsign(pattern) {
  pattern.headsign = `${pattern.headsign} (${pattern.lastStop})`
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
      const headsign = 'Everett via Lynnwood'
      const route = '512'
      const patterns = {
        P1: {
          headsign,
          id: 'P1',
          name: 'P1 Pattern name',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          stops: createStops(['S1', 'S2', 'S3', 'S4', 'S5'])
        },
        P2: {
          headsign,
          id: 'P2',
          name: 'P2 Pattern name',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          stops: createStops(['S3', 'S4', 'S6', 'S7'])
        },
        P3: {
          headsign,
          id: 'P3',
          name: 'P3 Pattern name',
          patternGeometry: {
            length: 987,
            points: 'p3-points'
          },
          stops: createStops(['S3', 'S4', 'S5'])
        }
      }
      const headsignData = extractMainHeadsigns(patterns, route, editHeadsign)
      expect(headsignData.length).toBe(2)
      expect(headsignData[0].headsign).toBe(headsign)
      expect(headsignData[1].headsign).toBe(`${headsign} (S7)`)
    })
  })
})
