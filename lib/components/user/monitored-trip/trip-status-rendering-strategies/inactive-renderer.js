import BaseRenderer from './base-renderer'

export default class InactiveRenderer extends BaseRenderer {
  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return 'Resume trip monitoring to see the updated status'
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return 'Trip monitoring is paused'
  }

  shouldRenderTogglePauseTripButton () {
    return true
  }
}
