import { FormattedMessage } from 'react-intl'
import React from 'react'

import { getMinutesUntilItineraryStart } from '../../../../util/itinerary'
import { getTripStatus, REALTIME_STATUS } from '../../../../util/viewer'
import FormattedDuration from '../../../util/formatted-duration'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are going to happen in the
 * future. Some realtime data might already exist when these trips are within
 * their lead time, so additional calculations and output occurs in those cases.
 */
export default function upcomingTripRenderer({
  monitoredTrip,
  onTimeThresholdSeconds
}) {
  const data = baseRenderer(monitoredTrip)
  const ONE_MINUTE = 60 * 1000

  const minutesUntilTripStart = getMinutesUntilItineraryStart(
    data.matchingItinerary
  )

  // set default panel bootstrap style
  data.panelBsStyle = 'info'
  const tripStart = data.matchingItinerary.startTime
  const monitoringStart =
    tripStart - monitoredTrip.leadTimeInMinutes * ONE_MINUTE
  data.bodyText = (
    <FormattedMessage
      id="components.TripStatusRenderers.upcoming.tripBegins"
      values={{
        monitoringStart: monitoringStart,
        tripStart: tripStart
      }}
    />
  )

  // set heading text and whether to show the alerts based on whether the
  // minutes until the trip starts is within the trip's lead time
  if (minutesUntilTripStart > monitoredTrip.leadTimeInMinutes) {
    // trip is not yet within lead time
    data.panelBsStyle = undefined
    data.headingText = (
      <FormattedMessage
        id="components.TripStatusRenderers.upcoming.nextTripBegins"
        values={{
          tripDatetime: tripStart
        }}
      />
    )

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
      const departureDeviationSeconds =
        (data.matchingItinerary.startTime -
          data.journeyState.scheduledDepartureTimeEpochMillis) /
        1000
      const absDeviation = Math.abs(departureDeviationSeconds)
      const tripStatus = getTripStatus(
        true,
        departureDeviationSeconds,
        onTimeThresholdSeconds
      )
      if (tripStatus === REALTIME_STATUS.ON_TIME) {
        // about on time
        data.headingText = (
          <FormattedMessage id="components.TripStatusRenderers.upcoming.tripStartsSoonOnTime" />
        )
        data.panelBsStyle = 'success'
      } else if (tripStatus === REALTIME_STATUS.LATE) {
        // delayed
        data.headingText = (
          <FormattedMessage
            id="components.TripStatusRenderers.upcoming.tripStartIsDelayed"
            values={{
              duration: (
                <FormattedDuration
                  duration={absDeviation}
                  includeSeconds={false}
                />
              )
            }}
          />
        )
        data.panelBsStyle = 'warning'
      } else {
        // early
        data.headingText = (
          <FormattedMessage
            id="components.TripStatusRenderers.upcoming.tripStartIsEarly"
            values={{
              duration: (
                <FormattedDuration
                  duration={absDeviation}
                  includeSeconds={false}
                />
              )
            }}
          />
        )
        data.panelBsStyle = 'warning'
      }
    } else {
      data.headingText = (
        <FormattedMessage id="components.TripStatusRenderers.upcoming.tripStartsSoonNoUpdates" />
      )
    }
  }

  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
