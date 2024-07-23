import { getDefaultQuery } from '../../lib/util/api'

describe('util > aoi', () => {
  describe('getDefaultQuery', () => {
    it('initializes numItineraries from config', () => {
      const config = {
        modes: {
          numItineraries: 5
        }
      }
      expect(getDefaultQuery(config).numItineraries).toBe(5)

      expect(getDefaultQuery({}).numItineraries).toBe(3)
    })
  })
})
