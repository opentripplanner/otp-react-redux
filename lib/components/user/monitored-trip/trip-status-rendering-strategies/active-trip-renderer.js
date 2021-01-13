import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are currently active.
 */
export default function activeTripRenderer ({ monitoredTrip, timeFormat }) {
  const data = baseRenderer(monitoredTrip)

  const tripEndMoment = moment(data.matchingItinerary.endTime)

  // analyze whether the journey state indicates that the matching itinerary
  // has realtime data. It is assumed that realtime data will exist for
  // itineraries that have differing values of the scheduled arrival time
  // and matching itinerary arrival time.
  if (data.journeyState.hasRealtimeData) {
    // calculate the deviation from the scheduled arrival time (positive
    // value indicates delay)
    const arrivalDeviationSeconds = (
      data.matchingItinerary.endTime -
      data.journeyState.scheduledArrivalTimeEpochMillis
    ) / 1000
    const deviationHumanDuration = formatDuration(
      Math.abs(arrivalDeviationSeconds)
    )
    if (Math.abs(arrivalDeviationSeconds) < data.ON_TIME_THRESHOLD_SECONDS) {
      // about on time
      data.panelBsStyle = 'success'
      data.headingText = 'Trip is in progress and is about on time.'
    } else if (arrivalDeviationSeconds > 0) {
      // delayed
      data.panelBsStyle = 'warning'
      data.headingText = `Trip is in progress and is delayed ${deviationHumanDuration}!`
    } else {
      // early
      data.panelBsStyle = 'warning'
      data.headingText = `Trip is in progress and is arriving ${deviationHumanDuration} earlier than expected!`
    }
  } else {
    data.panelBsStyle = 'info'
    data.headingText = 'Trip is in progress (no realtime updates available).'
  }

  data.bodyText =
    `Trip is due to arrive at the destination at ${tripEndMoment.format(timeFormat)}.`

  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
