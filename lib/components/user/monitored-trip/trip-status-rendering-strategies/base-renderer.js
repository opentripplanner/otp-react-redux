import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

export default class BaseRenderer {
  constructor (monitoredTrip) {
    this.monitoredTrip = monitoredTrip
    this.journeyState = monitoredTrip && monitoredTrip.journeyState
  }

  /**
   * Gets the alerts from the matching itinerary if they exists. This can still
   * return an empty array.
   */
  getAlerts () {
    if (!this.journeyState) return
    const { matchingItinerary } = this.journeyState
    if (!matchingItinerary) return
    return matchingItinerary.alerts
  }

  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    throw new Error('Please implement getBodyText in an implementing class!')
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    throw new Error('Please implement getHeadingText in an implementing class!')
  }

  /**
   * Gets the last checked time of the monitored trip. This method expects the
   * journeyState variable to be defined. An implementing class should be made
   * to handle cases where it is not defined.
   */
  getLastCheckedText () {
    if (!this.journeyState) {
      throw new Error('journeyState must exist in this class implementation!')
    }
    const secondsSinceLastCheck = moment().diff(
      moment(this.journeyState.lastCheckedEpochMillis),
      'seconds'
    )
    return `Last checked: ${formatDuration(secondsSinceLastCheck)} ago`
  }

  /**
   * Return the overall bootstrap panel style for the trip.
   */
  getPanelBsStyle () {
    return undefined
  }

  getTogglePauseTripButtonGlyphIcon () {
    return this.monitoredTrip && this.monitoredTrip.isActive
      ? 'pause'
      : 'play'
  }

  getTogglePauseTripButtonText () {
    return this.monitoredTrip && this.monitoredTrip.isActive
      ? 'Pause'
      : 'Resume'
  }

  getToggleSnoozeTripButtonGlyphIcon () {
    return this.monitoredTrip && this.monitoredTrip.snoozed
      ? 'play'
      : 'pause'
  }

  getToggleSnoozeTripButtonText () {
    return this.monitoredTrip && this.monitoredTrip.snoozed
      ? 'Unsnooze trip analysis'
      : 'Snooze for rest of today'
  }

  /**
   * Returns true if the overall trip status component should render.
   */
  shouldRender () {
    return !!(this.journeyState && this.journeyState.matchingItinerary)
  }

  /**
   * Returns true if the alerts should be rendered.
   */
  shouldRenderAlerts () {
    const alerts = this.getAlerts()
    if (!alerts || alerts.length === 0) return false
    return true
  }

  shouldRenderDeleteTripButton () {
    return false
  }

  shouldRenderPlanNewTripButton () {
    return false
  }

  shouldRenderTogglePauseTripButton () {
    return false
  }

  shouldRenderToggleSnoozeTripButton () {
    return false
  }
}
