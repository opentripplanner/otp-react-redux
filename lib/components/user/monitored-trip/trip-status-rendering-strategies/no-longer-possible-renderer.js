import BaseRenderer from './base-renderer'

export default class NoLongerPossibleRenderer extends BaseRenderer {
  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return 'The trip planner was unable to find your trip on any selected days of the week. Please try re-planning your itinerary to find an alternative route.'
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return 'Trip is no longer possible'
  }

  shouldRenderAlerts () {
    return false
  }

  shouldRenderDeleteTripButton () {
    return true
  }

  shouldRenderPlanNewTripButton () {
    return true
  }
}
