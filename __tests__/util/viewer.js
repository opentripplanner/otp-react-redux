import '../test-utils/mock-window-url'
import { extractHeadsignFromPattern } from '../../lib/util/viewer'

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
})
