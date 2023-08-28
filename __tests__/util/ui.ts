import { getItineraryView, ItineraryView } from '../../lib/util/ui'

describe('util > ui', () => {
  describe('getItineraryView', () => {
    it('returns a list mode by default or ui_activeItinerary is -1', () => {
      expect(getItineraryView({})).toBe(ItineraryView.LIST)
      expect(getItineraryView({ ui_activeItinerary: null })).toBe(
        ItineraryView.LIST
      )
      expect(getItineraryView({ ui_activeItinerary: -1 })).toBe(
        ItineraryView.LIST
      )
    })
    it('returns a full itinerary view if URL contains ui_activeItinerary', () => {
      expect(getItineraryView({ ui_activeItinerary: 2 })).toBe(
        ItineraryView.FULL
      )
    })
    it('returns the specified view mode when set in URL', () => {
      expect(getItineraryView({ ui_itineraryView: 'leg' })).toBe(
        ItineraryView.LEG
      )
    })
  })
})
