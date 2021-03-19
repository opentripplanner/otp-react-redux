import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips where the next trip isn't
 * possible. The trip might still be possible on other days.
 */
export default function nextTripNotPossibleRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip is not possible today'
  data.bodyText = 'The trip planner was unable to find your trip today. Please try re-planning your itinerary to find an alternative route.'
  data.shouldRenderAlerts = false
  data.shouldRenderPlanNewTripButton = true
  data.shouldRenderTogglePauseTripButton = true

  return data
}
