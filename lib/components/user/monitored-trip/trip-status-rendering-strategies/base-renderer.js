import { differenceInSeconds } from 'date-fns'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import FormattedDuration from '../../../util/formatted-duration'

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
    journeyState: monitoredTrip && monitoredTrip.journeyState,
    lastCheckedText: (
      <FormattedMessage id="components.TripStatusRenderers.base.lastCheckedDefaultText" />
    ),
    monitoredTrip: monitoredTrip,
    tripIsActive: monitoredTrip && monitoredTrip.isActive,
    tripIsSnoozed: monitoredTrip && monitoredTrip.snoozed
  }
  data.matchingItinerary =
    data.journeyState && data.journeyState.matchingItinerary

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
            <FormattedDuration duration={secondsSinceLastCheck} />
          )
        }}
      />
    )
  }

  // set some alert data if the matching itinerary exists
  data.alerts = data.matchingItinerary && data.matchingItinerary.alerts
  data.hasMoreThanOneAlert = !!(data.alerts && data.alerts.length > 0)
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
