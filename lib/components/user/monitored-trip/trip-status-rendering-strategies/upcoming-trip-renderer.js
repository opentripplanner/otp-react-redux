import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

import { getMinutesUntilItineraryStart } from '../../../../util/itinerary'

import baseRenderer from './base-renderer'

export default function upcomingTripRenderer ({
  dateFormat,
  monitoredTrip,
  timeFormat
}) {
  const data = baseRenderer(monitoredTrip)

  const extendedDateTimeFormat = `dddd ${dateFormat} [at] ${timeFormat}`
  const tripStartMoment = moment(data.matchingItinerary.startTime)
  const minutesUntilTripStart = getMinutesUntilItineraryStart(
    data.matchingItinerary
  )

  // set default panel bootstrap style
  data.panelBsStyle = 'info'

  // set body
  data.bodyText = `Trip is due to begin at ${tripStartMoment.format(timeFormat)}.`

  // set heading text and whether to show the alerts based on whether the
  // minutes until the trip starts is within the trip's lead time
  if (minutesUntilTripStart > monitoredTrip.leadTimeInMinutes) {
    // trip is not yet within lead time
    data.headingText =
      `Next trip starts on ${tripStartMoment.format(extendedDateTimeFormat)}.`
    data.shouldRenderAlerts = false
  } else {
    // trip is within lead time

    // analyze whether the journey state indicates that the matching itinerary
    // has realtime data. It is assumed that realtime data will exist for
    // itineraries that have differing values of the scheduled departure time
    // and matching itinerary departure time.
    if (data.journeyState.hasRealtimeData) {
      // calculate the deviation from the scheduled departure time (positive
      // value indicates delay)
      const departureDeviationSeconds = (
        data.matchingItinerary.startTime -
          data.journeyState.scheduledDepartureTimeEpochMillis
      ) / 1000
      const deviationHumanDuration = formatDuration(
        Math.abs(departureDeviationSeconds)
      )
      if (Math.abs(departureDeviationSeconds) < data.ON_TIME_THRESHOLD_SECONDS) {
        // about on time
        data.headingText = 'Trip is starting soon and is about on time.'
        data.panelBsStyle = 'success'
      } else if (departureDeviationSeconds > 0) {
        // delayed
        data.headingText = `Trip start time is delayed ${deviationHumanDuration}!`
        data.panelBsStyle = 'warning'
      } else {
        // early
        data.headingText = `Trip start time is happening ${deviationHumanDuration} earlier than expected!`
        data.panelBsStyle = 'warning'
      }
    } else {
      data.headingText = 'Trip is starting soon (no realtime updates available).'
      data.panelBsStyle = undefined
    }

    data.shouldRenderAlerts = true
  }

  data.shouldRenderAlerts = data.shouldRenderAlerts && data.hasMoreThanOneAlert
  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
