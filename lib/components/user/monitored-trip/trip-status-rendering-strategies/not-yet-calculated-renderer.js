import baseRenderer from './base-renderer'

export default function notYetCalculatedTripRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip not yet calculated'
  data.lastCheckedText = 'Awaiting calculation...'
  data.bodyText = 'Please wait a bit for the trip to calculate.'
  data.shouldRenderAlerts = false

  return data
}
