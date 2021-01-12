import BaseRenderer from './base-renderer'

export default class NotYetCalculatedTripRenderer extends BaseRenderer {
  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return 'Please wait a bit for the trip to calculate.'
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return 'Trip not yet calculated'
  }

  getLastCheckedText () {
    return 'Awaiting calculation...'
  }

  shouldRenderAlerts () {
    return false
  }
}
