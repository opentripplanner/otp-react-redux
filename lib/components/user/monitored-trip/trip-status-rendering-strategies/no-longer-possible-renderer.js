import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are no longer possible after
 * otp-middleware was unable to find a matching itinerary for a whole week.
 */
export default function noLongerPossibleRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip is no longer possible'
  data.bodyText = 'The trip planner was unable to find your trip on any selected days of the week. Please try re-planning your itinerary to find an alternative route.'
  data.shouldRenderAlerts = false
  data.shouldRenderDeleteTripButton = true
  data.shouldRenderPlanNewTripButton = true

  return data
}
