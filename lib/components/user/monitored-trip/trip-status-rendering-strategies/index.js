import activeTripRenderer from './active-trip-renderer'
import inactiveRenderer from './inactive-renderer'
import nextTripNotPossibleRenderer from './next-trip-not-possible-renderer'
import noLongerPossibleRenderer from './no-longer-possible-renderer'
import notYetCalculatedTripRenderer from './not-yet-calculated-renderer'
import pastTripRenderer from './past-trip-renderer'
import snoozedRenderer from './snoozed-renderer'
import upcomingTripRenderer from './upcoming-trip-renderer'

/**
 * Uses the strategy pattern to calculate various pieces of data about a
 * monitored trip based off of whether it is in one of the following states:
 * - not yet calculated by the otp-middleware trip monitor
 * - set to be inactive (the trip monitor won't check it) by the user
 * - snoozed for the day by the user
 * - being no longer possible (the matching itinerary wasn't found for a whole
 *    week)
 * - the next trip isn't possible (other days might still be possible)
 * - the next trip will happen at some point in the future (in this state, the
 *    trip monitor might have already calculated some realtime data)
 * - the trip is active (currently in progress)
 */
export default function getRenderData(props) {
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
  } else if (journeyState.tripStatus === 'PAST_TRIP') {
    data = pastTripRenderer(monitoredTrip)
  } else {
    // trip status not yet calculated
    data = notYetCalculatedTripRenderer(monitoredTrip)
  }

  return data
}
