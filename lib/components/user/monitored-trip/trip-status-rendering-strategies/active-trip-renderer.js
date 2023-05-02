import { FormattedMessage } from 'react-intl'
import React from 'react'

import { getTripStatus, REALTIME_STATUS } from '../../../../util/viewer'
import FormattedDuration from '../../../util/formatted-duration'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are currently active.
 */
export default function activeTripRenderer({
  monitoredTrip,
  onTimeThresholdSeconds
}) {
  const data = baseRenderer(monitoredTrip)

  // analyze whether the journey state indicates that the matching itinerary
  // has realtime data. It is assumed that realtime data will exist for
  // itineraries that have differing values of the scheduled arrival time
  // and matching itinerary arrival time.
  if (data.journeyState.hasRealtimeData) {
    // calculate the deviation from the scheduled arrival time (positive
    // value indicates delay)
    const arrivalDeviationSeconds =
      (data.matchingItinerary.endTime -
        data.journeyState.scheduledArrivalTimeEpochMillis) /
      1000
    const tripStatus = getTripStatus(
      true,
      arrivalDeviationSeconds,
      onTimeThresholdSeconds
    )
    if (tripStatus === REALTIME_STATUS.ON_TIME) {
      // about on time
      data.panelBsStyle = 'success'
      data.headingText = (
        <FormattedMessage id="components.TripStatusRenderers.active.onTimeHeading" />
      )
    } else if (tripStatus === REALTIME_STATUS.LATE) {
      // delayed
      data.panelBsStyle = 'warning'
      data.headingText = (
        <FormattedMessage
          id="components.TripStatusRenderers.active.delayedHeading"
          values={{
            formattedDuration: (
              <FormattedDuration
                duration={Math.abs(arrivalDeviationSeconds)}
                includeSeconds={false}
              />
            )
          }}
        />
      )
    } else {
      // early
      data.panelBsStyle = 'warning'
      data.headingText = (
        <FormattedMessage
          id="components.TripStatusRenderers.active.earlyHeading"
          values={{
            formattedDuration: (
              <FormattedDuration
                duration={Math.abs(arrivalDeviationSeconds)}
                includeSeconds={false}
              />
            )
          }}
        />
      )
    }
  } else {
    data.panelBsStyle = 'info'
    data.headingText = (
      <FormattedMessage id="components.TripStatusRenderers.active.noDataHeading" />
    )
  }

  data.bodyText = (
    <FormattedMessage
      id="components.TripStatusRenderers.active.description"
      values={{ arrivalTime: data.matchingItinerary.endTime }}
    />
  )

  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
