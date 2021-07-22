import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

/**
 * Calculate commonly-used pieces of data used to render the trip status
 * component. The monitoredTrip param can be undefined.
 */
export default function baseRenderer (monitoredTrip) {
  const data = {
    // create some default display values in case another renderer doesn't
    // calculate these values
    body: 'Unknown trip state',
    headingText: 'Unknown trip state',
    journeyState: monitoredTrip && monitoredTrip.journeyState,
    lastCheckedText: 'Last checked time unknown',
    monitoredTrip: monitoredTrip,
    tripIsActive: monitoredTrip && monitoredTrip.isActive,
    tripIsSnoozed: monitoredTrip && monitoredTrip.snoozed
  }
  data.matchingItinerary =
    data.journeyState && data.journeyState.matchingItinerary

  // set the last checked text if the journey state exists
  if (data.journeyState) {
    const secondsSinceLastCheck = moment().diff(
      moment(data.journeyState.lastCheckedEpochMillis),
      'seconds'
    )
    data.lastCheckedText =
      `Last checked: ${formatDuration(secondsSinceLastCheck)} ago`
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
    data.togglePauseTripButtonText = 'Pause'
  } else {
    data.togglePauseTripButtonGlyphIcon = 'play'
    data.togglePauseTripButtonText = 'Resume'
  }

  if (data.tripIsSnoozed) {
    data.toggleSnoozeTripButtonGlyphIcon = 'play'
    data.toggleSnoozeTripButtonText = 'Unsnooze trip analysis'
  } else {
    data.toggleSnoozeTripButtonGlyphIcon = 'pause'
    data.toggleSnoozeTripButtonText = 'Snooze for rest of today'
  }

  return data
}
