import BaseRenderer from './base-renderer'

export default class NextTripNotPossibleRenderer extends BaseRenderer {
  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return 'The trip planner was unable to find your trip today. Please try re-planning your itinerary to find an alternative route.'
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return 'Trip is not possible today'
  }

  shouldRenderAlerts () {
    return false
  }

  shouldRenderPlanNewTripButton () {
    return true
  }

  shouldRenderTogglePauseTripButton () {
    return true
  }
}
