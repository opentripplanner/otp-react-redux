import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips where otp-middleware has yet to
 * calculate when the next trip is occurring.
 */
export default function notYetCalculatedTripRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip not yet calculated'
  data.lastCheckedText = 'Awaiting calculation...'
  data.bodyText = 'Please wait a bit for the trip to calculate.'
  data.shouldRenderAlerts = false

  return data
}
