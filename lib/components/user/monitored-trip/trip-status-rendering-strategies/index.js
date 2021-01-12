import ActiveTripRenderer from './active-trip-renderer'
import InactiveRenderer from './inactive-renderer'
import NextTripNotPossibleRenderer from './next-trip-not-possible-renderer'
import NoLongerPossibleRenderer from './no-longer-possible-renderer'
import NotYetCalculatedTripRenderer from './not-yet-calculated-renderer'
import SnoozedRenderer from './snoozed-renderer'
import UpcomingTripRenderer from './upcoming-trip-renderer'

export default function getRenderingStrategy (monitoredTrip) {
  const journeyState = monitoredTrip && monitoredTrip.journeyState

  if (!monitoredTrip || !journeyState) {
    return new NotYetCalculatedTripRenderer()
  } else if (!monitoredTrip.isActive) {
    return new InactiveRenderer(monitoredTrip)
  } else if (monitoredTrip.snoozed) {
    return new SnoozedRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'NO_LONGER_POSSIBLE') {
    return new NoLongerPossibleRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'NEXT_TRIP_NOT_POSSIBLE') {
    return new NextTripNotPossibleRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'TRIP_UPCOMING') {
    return new UpcomingTripRenderer(monitoredTrip)
  } else if (journeyState.tripStatus === 'TRIP_ACTIVE') {
    return new ActiveTripRenderer(monitoredTrip)
  } else {
    // trip status not yet calculated
    return new NotYetCalculatedTripRenderer(monitoredTrip)
  }
}
