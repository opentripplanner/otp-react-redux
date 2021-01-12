import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

import { getMinutesUntilItineraryStart } from '../../../../util/itinerary'

import BaseRenderer from './base-renderer'

export default class UpcomingTripRenderer extends BaseRenderer {
  constructor ({
    dateFormat,
    monitoredTrip,
    timeFormat
  }) {
    super(monitoredTrip)

    const extendedDateTimeFormat = `dddd ${dateFormat} [at] ${timeFormat}`
    const tripStartMoment = moment(this.matchingItinerary.startTime)
    const minutesUntilTripStart = getMinutesUntilItineraryStart(
      this.matchingItinerary
    )

    // set default panel bootstrap style
    this.panelBsStyle = 'info'

    // set body
    this.bodyText = `Trip is due to begin at ${tripStartMoment.format(timeFormat)}.`

    // set heading text and whether to show the alerts based on whether the
    // minutes until the trip starts is within the trip's lead time
    if (minutesUntilTripStart > monitoredTrip.leadTimeInMinutes) {
      // trip is not yet within lead time
      this.headingText =
        `Next trip starts on ${tripStartMoment.format(extendedDateTimeFormat)}.`
      this.showAlerts = false
      return
    }

    // trip is within lead time
    this.showAlerts = true

    // analyze whether the journey state indicates that the matching itinerary
    // has realtime data. It is assumed that realtime data will exist for
    // itineraries that have differing values of the scheduled departure time
    // and matching itinerary departure time.
    if (this.journeyState.hasRealtimeData) {
      // calculate the deviation from the scheduled departure time (positive
      // value indicates delay)
      const departureDeviationSeconds = (
        this.matchingItinerary.startTime -
          this.journeyState.scheduledDepartureTimeEpochMillis
      ) / 1000
      const deviationHumanDuration = formatDuration(
        Math.abs(departureDeviationSeconds)
      )
      if (Math.abs(departureDeviationSeconds) < this.ON_TIME_THRESHOLD_SECONDS) {
        // about on time
        this.headingText = 'Trip is starting soon and is about on time.'
        this.panelBsStyle = 'success'
      } else if (departureDeviationSeconds > 0) {
        // delayed
        this.headingText = `Trip start time is delayed ${deviationHumanDuration}!`
        this.panelBsStyle = 'warning'
      } else {
        // early
        this.headingText = `Trip start time is happening ${deviationHumanDuration} earlier than expected!`
        this.panelBsStyle = 'warning'
      }
    } else {
      this.headingText = 'Trip is starting soon (no realtime updates available).'
      this.panelBsStyle = undefined
    }
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

  /**
   * Returns false for upcoming trips that aren't within the lead time
   */
  shouldRenderAlerts () {
    return this.showAlerts && this.hasMoreThanOneAlert()
  }

  shouldRenderTogglePauseTripButton () {
    return true
  }

  shouldRenderToggleSnoozeTripButton () {
    return true
  }
}
