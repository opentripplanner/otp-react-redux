import { differenceInSeconds } from 'date-fns'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import FormattedDuration from '../../../util/formatted-duration'

/**
 * Helper function that changes alert timestamps from milliseconds to seconds
 * for display using the alerts body component from itinerary-body.
 */
function withAlertTimestampsInSeconds(alert) {
  return {
    ...alert,
    effectiveEndDate: alert.effectiveEndDate / 1000,
    effectiveStartDate: alert.effectiveStartDate / 1000
  }
}

/**
 * Calculate commonly-used pieces of data used to render the trip status
 * component. The monitoredTrip param can be undefined.
 */
export default function baseRenderer(monitoredTrip) {
  const data = {
    // create some default display values in case another renderer doesn't
    // calculate these values
    body: (
      <FormattedMessage id="components.TripStatusRenderers.base.unknownState" />
    ),
    headingText: (
      <FormattedMessage id="components.TripStatusRenderers.base.unknownState" />
    ), // same default msg as body
    journeyState: monitoredTrip?.journeyState,
    lastCheckedText: (
      <FormattedMessage id="components.TripStatusRenderers.base.lastCheckedDefaultText" />
    ),
    monitoredTrip: monitoredTrip,
    tripIsActive: monitoredTrip?.isActive,
    tripIsSnoozed: monitoredTrip?.snoozed
  }
  data.matchingItinerary = data.journeyState?.matchingItinerary

  // set the last checked text if the journey state exists
  if (data.journeyState) {
    const secondsSinceLastCheck = differenceInSeconds(
      new Date(),
      new Date(data.journeyState.lastCheckedEpochMillis)
    )
    data.lastCheckedText = (
      <FormattedMessage
        id="components.TripStatusRenderers.base.lastCheckedText"
        values={{
          formattedDuration: (
            <FormattedDuration
              duration={secondsSinceLastCheck}
              includeSeconds={false}
            />
          )
        }}
      />
    )
  }

  // Set some alert data if the matching itinerary exists.
  // (Convert alert timestamps in milliseconds to seconds for display using alerts body.)
  data.alerts = data.matchingItinerary?.alerts?.map(
    withAlertTimestampsInSeconds
  )
  data.hasMoreThanOneAlert = !!(data.alerts?.length > 0)
  data.shouldRenderAlerts = data.hasMoreThanOneAlert

  // set some defaults for the toggle buttons
  data.shouldRenderDeleteTripButton = false
  data.shouldRenderPlanNewTripButton = false
  data.shouldRenderTogglePauseTripButton = false
  data.shouldRenderToggleSnoozeTripButton = false

  if (data.tripIsActive) {
    data.togglePauseTripButtonGlyphIcon = 'pause'
    data.togglePauseTripButtonText = (
      <FormattedMessage id="components.TripStatusRenderers.base.togglePause" />
    )
  } else {
    data.togglePauseTripButtonGlyphIcon = 'play'
    data.togglePauseTripButtonText = (
      <FormattedMessage id="components.TripStatusRenderers.base.untogglePause" />
    )
  }

  if (data.tripIsSnoozed) {
    data.toggleSnoozeTripButtonGlyphIcon = 'play'
    data.toggleSnoozeTripButtonText = (
      <FormattedMessage id="components.TripStatusRenderers.base.tripIsSnoozed" />
    )
  } else {
    data.toggleSnoozeTripButtonGlyphIcon = 'pause'
    data.toggleSnoozeTripButtonText = (
      <FormattedMessage id="components.TripStatusRenderers.base.tripIsNotSnoozed" />
    )
  }

  return data
}
