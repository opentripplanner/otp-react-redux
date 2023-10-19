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
      const expectedValues = {
        [ItineraryView.FULL]: ItineraryView.LIST,
        [ItineraryView.LEG]: ItineraryView.LIST,
        [ItineraryView.LEG_HIDDEN]: ItineraryView.LIST,
        [ItineraryView.LIST]: ItineraryView.LIST,
        [ItineraryView.LIST_HIDDEN]: ItineraryView.LIST_HIDDEN
      }
      Object.entries(expectedValues).forEach(([k, v]) => {
        expect(
          getItineraryView({
            ui_activeItinerary: -1,
            ui_itineraryView: k
          })
        ).toBe(v)
      })
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
      const expectedValues = {
        [ItineraryView.LEG]: ItineraryView.LEG_HIDDEN,
        [ItineraryView.LEG_HIDDEN]: ItineraryView.LEG,
        [ItineraryView.LIST]: ItineraryView.LIST_HIDDEN,
        [ItineraryView.LIST_HIDDEN]: ItineraryView.LIST
      }
      Object.entries(expectedValues).forEach(([k, v]) => {
        expect(getMapToggleNewItineraryView(k)).toBe(v)
      })
    })
  })
})
