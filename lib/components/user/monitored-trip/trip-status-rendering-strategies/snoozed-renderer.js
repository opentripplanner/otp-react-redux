import BaseRenderer from './base-renderer'

export default class SnoozedRenderer extends BaseRenderer {
  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return 'Unsnooze trip monitoring to see the updated status'
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return 'Trip monitoring is snoozed for today'
  }

  shouldRenderAlerts () {
    return false
  }

  shouldRenderToggleSnoozeTripButton () {
    return true
  }
}
