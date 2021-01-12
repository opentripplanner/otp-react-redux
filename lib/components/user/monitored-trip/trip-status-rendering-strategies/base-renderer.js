import moment from 'moment'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'

export default function baseRenderer (monitoredTrip) {
  const data = {
    // the threshold for schedule deviation in seconds for whether an arrival or
    // departure time is to be considered on-time
    ON_TIME_THRESHOLD_SECONDS: 120,
    monitoredTrip: monitoredTrip,
    journeyState: monitoredTrip && monitoredTrip.journeyState,
    tripIsActive: monitoredTrip && monitoredTrip.isActive,
    tripIsSnoozed: monitoredTrip && monitoredTrip.snoozed
  }
  data.matchingItinerary =
    data.journeyState && data.journeyState.matchingItinerary
  data.shouldRender = !!data.matchingItinerary

  // set the last checked text if the journey state exists
  if (data.journeyState) {
    const secondsSinceLastCheck = moment().diff(
      moment(this.journeyState.lastCheckedEpochMillis),
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
