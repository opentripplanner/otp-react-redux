import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are have been set to be
 * snoozed for the rest of the day.
 */
export default function snoozedRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip monitoring is snoozed for today'
  data.bodyText = 'Unsnooze trip monitoring to see the updated status'
  data.shouldRenderAlerts = false
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
