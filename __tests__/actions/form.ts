import '../test-utils/mock-window-url'
import { checkShouldReplanTrip } from '../../lib/actions/form'

describe('actions > form', () => {
  describe('checkShouldReplanTrip', () => {
    it('should not replan trip on mobile (with default autoPlan settings) if both locations change from null', () => {
      const autoPlan = {
        default: 'ONE_LOCATION_CHANGED',
        mobile: 'BOTH_LOCATIONS_CHANGED'
      }
      const oldQuery = {
        from: null,
        to: null
      }
      const newQuery = {
        from: { name: 'From place' },
        to: { name: 'To place' }
      }
      expect(
        checkShouldReplanTrip(autoPlan, true, oldQuery, newQuery)
          .shouldReplanTrip
      ).toBe(null)
    })
  })
})
