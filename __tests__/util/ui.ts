import {
  getItineraryView,
  getMapToggleNewItineraryView,
  ItineraryView
} from '../../lib/util/ui'

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
    it('returns a full itinerary view if URL contains ui_activeItinerary that is not -1', () => {
      expect(getItineraryView({ ui_activeItinerary: 2 })).toBe(
        ItineraryView.FULL
      )
    })
    it('returns an itinerary list view if URL contains ui_activeItinerary=-1 regardless of ui_itineraryView', () => {
      expect(
        getItineraryView({
          ui_activeItinerary: -1,
          ui_itineraryView: ItineraryView.FULL
        })
      ).toBe(ItineraryView.LIST)
      expect(
        getItineraryView({
          ui_activeItinerary: -1,
          ui_itineraryView: ItineraryView.LEG
        })
      ).toBe(ItineraryView.LIST)
      expect(
        getItineraryView({
          ui_activeItinerary: -1,
          ui_itineraryView: ItineraryView.LEG_HIDDEN
        })
      ).toBe(ItineraryView.LIST)
      expect(
        getItineraryView({
          ui_activeItinerary: -1,
          ui_itineraryView: ItineraryView.LIST_HIDDEN
        })
      ).toBe(ItineraryView.LIST_HIDDEN)
    })
    it('returns the specified view mode when set in URL', () => {
      expect(
        getItineraryView({
          ui_activeItinerary: 0,
          ui_itineraryView: ItineraryView.LEG
        })
      ).toBe(ItineraryView.LEG)
    })
  })
  describe('getMapToggleNewItineraryView', () => {
    it('should obtain the new itinerary view value', () => {
      expect(getMapToggleNewItineraryView(ItineraryView.LEG)).toBe(
        ItineraryView.LEG_HIDDEN
      )
      expect(getMapToggleNewItineraryView(ItineraryView.LIST)).toBe(
        ItineraryView.LIST_HIDDEN
      )
      expect(getMapToggleNewItineraryView(ItineraryView.LEG_HIDDEN)).toBe(
        ItineraryView.LEG
      )
      expect(getMapToggleNewItineraryView(ItineraryView.LIST_HIDDEN)).toBe(
        ItineraryView.LIST
      )
    })
  })
})
