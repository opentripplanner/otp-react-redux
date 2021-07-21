import moment from 'moment'
import { useIntl } from 'react-intl'

import { FormattedDuration } from '../../../default/format-duration'

/**
 * Calculate commonly-used pieces of data used to render the trip status
 * component. The monitoredTrip param can be undefined.
 */
export default function baseRenderer (monitoredTrip) {
  const intl = useIntl()
  const data = {
    // create some default display values in case another renderer doesn't
    // calculate these values
    body: intl.formatMessage({id: 'components.BaseRenderer.bodyDefault'}),
    headingText: intl.formatMessage({id: 'components.BaseRenderer.bodyDefault'}), // same default msg as body
    lastCheckedText: intl.formatMessage({id: 'components.BaseRenderer.lastCheckedDefaultText'}),
    monitoredTrip: monitoredTrip,
    journeyState: monitoredTrip && monitoredTrip.journeyState,
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
    data.lastCheckedText = intl.formatMessage({
      id: 'components.BaseRenderer.lastCheckedText',
      values: {
        formattedDuration: <FormattedDuration
          values={secondsSinceLastCheck}
        />
      }
    })
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
    data.toggleSnoozeTripButtonText = intl.formatMessage({
      id: 'components.BaseRenderer.toggleSnoozeTripButtonText',
      values: {tripIsSnoozed: data.tripIsSnoozed ? 'true' : 'false'}
    })
  } else {
    data.toggleSnoozeTripButtonGlyphIcon = 'pause'
    data.toggleSnoozeTripButtonText = intl.formatMessage({
      id: 'components.BaseRenderer.toggleSnoozeTripButtonText',
      values: {tripIsSnoozed: data.tripIsSnoozed ? 'true' : 'false'}
    })
  }

  return data
}
