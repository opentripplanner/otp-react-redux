import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are have been set to an
 * inactive state by a user.
 */
export default function inactiveRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip monitoring is paused'
  data.bodyText = 'Resume trip monitoring to see the updated status'
  data.shouldRenderAlerts = false
  data.shouldRenderTogglePauseTripButton = true

  return data
}
