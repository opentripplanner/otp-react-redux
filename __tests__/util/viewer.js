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

    it('should remove leading "To " text in a headsign (English only)', () => {
      const pattern = {
        headsign: 'To Angle Lake'
      }
      expect(extractHeadsignFromPattern(pattern)).toBe('Angle Lake')
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

    it('should use the description provided if it is not the same as the route short name', () => {
      const pattern = {
        desc: 'Southbound Express'
      }
      expect(extractHeadsignFromPattern(pattern, '49')).toBe(
        'Southbound Express'
      )
    })

    it('should use the last stop name of a pattern if no headsign is provided', () => {
      const stopNames = ['First stop', 'Second stop', 'Last stop']
      const pattern = {
        // If no headsigns are provided in feed, OTP might use the route short name as pattern name/description.
        desc: '49',
        stops: stopNames.map((s) => ({ name: s }))
      }
      expect(extractHeadsignFromPattern(pattern, '49')).toBe('Last stop')
    })
  })
})
