import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

import BaseRenderer from './base-renderer'

export default class ActiveTripRenderer extends BaseRenderer {
  constructor ({
    monitoredTrip,
    timeFormat
  }) {
    super(monitoredTrip)

    const tripEndMoment = moment(this.matchingItinerary.endTime)

    // analyze whether the journey state indicates that the matching itinerary
    // has realtime data. It is assumed that realtime data will exist for
    // itineraries that have differing values of the scheduled arrival time
    // and matching itinerary arrival time.
    if (this.journeyState.hasRealtimeData) {
      // calculate the deviation from the scheduled arrival time (positive
      // value indicates delay)
      const arrivalDeviationSeconds = (
        this.matchingItinerary.endTime -
        this.journeyState.scheduledArrivalTimeEpochMillis
      ) / 1000
      const deviationHumanDuration = formatDuration(
        Math.abs(arrivalDeviationSeconds)
      )
      if (Math.abs(arrivalDeviationSeconds) < this.ON_TIME_THRESHOLD_SECONDS) {
        // about on time
        this.headingText = 'Trip is in progress and is about on time.'
        this.panelBsStyle = 'success'
      } else if (arrivalDeviationSeconds > 0) {
        // delayed
        this.headingText = `Trip is in progress and is delayed ${deviationHumanDuration}!`
        this.panelBsStyle = 'warning'
      } else {
        // early
        this.headingText = `Trip is in progress and is arriving ${deviationHumanDuration} earlier than expected!`
        this.panelBsStyle = 'warning'
      }
    } else {
      this.headingText = 'Trip is in progress (no realtime updates available).'
      this.panelBsStyle = undefined
    }

    this.bodyText =
      `Trip is due to arrive at the desitination at ${tripEndMoment.format(timeFormat)}.`
  }

  /**
   * Gets the body text for the trip.
   */
  getBodyText () {
    return this.bodyText
  }

  /**
   * Gets the header title text for the trip.
   */
  getHeadingText () {
    return this.headingText
  }

  getPanelBsStyle () {
    return this.panelBsStyle
  }

  shouldRenderTogglePauseTripButton () {
    return true
  }

  shouldRenderToggleSnoozeTripButton () {
    return true
  }
}
