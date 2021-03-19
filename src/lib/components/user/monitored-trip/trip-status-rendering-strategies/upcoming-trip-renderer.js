import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

import { getMinutesUntilItineraryStart } from '../../../../util/itinerary'
import { getTripStatus, REALTIME_STATUS } from '../../../../util/viewer'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are going to happen in the
 * future. Some realtime data might already exist when these trips are within
 * their lead time, so additional calculations and output occurs in those cases.
 */
export default function upcomingTripRenderer ({
  dateFormat,
  monitoredTrip,
  onTimeThresholdSeconds,
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
  const monitoringStartMoment = moment(tripStartMoment).subtract(
    monitoredTrip.leadTimeInMinutes,
    'minutes'
  )
  data.bodyText =
    `Trip is due to begin at ${tripStartMoment.format(timeFormat)}. (realtime monitoring will begin at ${monitoringStartMoment.format(timeFormat)})`

  // set heading text and whether to show the alerts based on whether the
  // minutes until the trip starts is within the trip's lead time
  if (minutesUntilTripStart > monitoredTrip.leadTimeInMinutes) {
    // trip is not yet within lead time
    data.panelBsStyle = undefined
    data.headingText =
      `Next trip starts on ${tripStartMoment.format(extendedDateTimeFormat)}.`
    // Do not render alerts if the lead time hasn't passed yet. If there are
    // alerts in the upcoming trip, it is possible that these alerts are now
    // stale due to the trip not having been calculated in a while. Therefore,
    // they shouldn't be shown until after the lead time.
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
      const tripStatus = getTripStatus(
        true,
        departureDeviationSeconds,
        onTimeThresholdSeconds
      )
      if (tripStatus === REALTIME_STATUS.ON_TIME) {
        // about on time
        data.headingText = 'Trip is starting soon and is about on time.'
        data.panelBsStyle = 'success'
      } else if (tripStatus === REALTIME_STATUS.LATE) {
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
    }
  }

  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
