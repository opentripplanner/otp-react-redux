import activeTripRenderer from './active-trip-renderer'
import inactiveRenderer from './inactive-renderer'
import nextTripNotPossibleRenderer from './next-trip-not-possible-renderer'
import noLongerPossibleRenderer from './no-longer-possible-renderer'
import notYetCalculatedTripRenderer from './not-yet-calculated-renderer'
import snoozedRenderer from './snoozed-renderer'
import upcomingTripRenderer from './upcoming-trip-renderer'

export default function getRenderData (props) {
  const { monitoredTrip } = props
  const journeyState = monitoredTrip && monitoredTrip.journeyState

  let data
  if (!monitoredTrip || !journeyState) {
    data = notYetCalculatedTripRenderer()
  } else if (!monitoredTrip.isActive) {
    data = inactiveRenderer(monitoredTrip)
  } else if (monitoredTrip.snoozed) {
    data = snoozedRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'NO_LONGER_POSSIBLE') {
    data = noLongerPossibleRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'NEXT_TRIP_NOT_POSSIBLE') {
    data = nextTripNotPossibleRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'TRIP_UPCOMING') {
    data = upcomingTripRenderer(props)
  } else if (journeyState.tripStatus === 'TRIP_ACTIVE') {
    data = activeTripRenderer(props)
  } else {
    // trip status not yet calculated
    data = notYetCalculatedTripRenderer(monitoredTrip)
  }

  // make sure required fields are populated
  const requiredFields = [
    'bodyText',
    'headingText',
    'lastCheckedText'
  ]
  const missingFields = requiredFields.filter(field => !data[field])
  if (missingFields.length > 0) {
    throw new Error(`Required fields are missing from renderer: ${missingFields.join(', ')}`)
  }

  return data
}
