import baseRenderer from './base-renderer'

export default function inactiveRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip monitoring is paused'
  data.bodyText = 'Resume trip monitoring to see the updated status'
  data.shouldRenderAlerts = false
  data.shouldRenderTogglePauseTripButton = true

  return data
}
