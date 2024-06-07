import '../test-utils/mock-window-url'
import {
  extractHeadsignFromPattern,
  extractMainHeadsigns
} from '../../lib/util/viewer'

function createStop(id) {
  return {
    id,
    name: id
  }
}

function prefixHeadsign(pattern) {
  pattern.headsign = `To ${pattern.headsign}`
}

describe('util > viewer', () => {
  describe('extractHeadsignFromPattern', () => {
    it('should return pattern headsign if present', () => {
      const pattern = {
        headsign: 'Sesame Street'
      }
      expect(extractHeadsignFromPattern(pattern)).toBe('Sesame Street')
    })

    it('should extract headsign from pattern description if no headsign present', () => {
      const pattern = {
        desc: '49 to Sesame Street (70:3562) from Airport Station'
      }
      expect(extractHeadsignFromPattern(pattern)).toBe('Sesame Street')
    })

    it('should remove route short name from extracted headsign if no open bracket is present', () => {
      const pattern = {
        desc: 'Cookie Line Sesame Street'
      }
      expect(extractHeadsignFromPattern(pattern, 'Cookie Line')).toBe(
        'Sesame Street'
      )
    })
  })

  describe('extractMainHeadsigns', () => {
    it('should retain the essential patterns', () => {
      // Consider the following patterns P1, P2, P3 of the same route with the same headsigns:
      // Stops 1  2  3  4  5  6  7 --> direction of travel
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
          name: '512 to Everett Station (CommTrans:2861) from SODO Busway & S Royal Brougham Way (kcm:99267)',
          patternGeometry: {
            length: 1404,
            points: 'p1-points'
          },
          stops: [
            createStop('S1'),
            createStop('S2'),
            createStop('S3'),
            createStop('S4'),
            createStop('S5')
          ]
        },
        P2: {
          headsign,
          id: 'P2',
          name: '512 to Hewitt Ave & Virginia Ave (CommTrans:427)',
          patternGeometry: {
            length: 1072,
            points: 'p2-points'
          },
          stops: [
            createStop('S3'),
            createStop('S4'),
            createStop('S6'),
            createStop('S7')
          ]
        },
        P3: {
          headsign,
          id: 'P3',
          name: '512 to Everett Station (CommTrans:2861) from Northgate Station Bay 2 (CommTrans:2192)',
          patternGeometry: {
            length: 987,
            points: 'p3-points'
          },
          stops: [createStop('S3'), createStop('S4'), createStop('S5')]
        }
      }
      const headsignData = extractMainHeadsigns(patterns, route, prefixHeadsign)
      expect(headsignData.length).toBe(2)
    })
  })
})
