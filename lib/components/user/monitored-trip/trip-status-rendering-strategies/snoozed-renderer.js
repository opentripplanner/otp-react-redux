import baseRenderer from './base-renderer'

export default function snoozedRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = 'Trip monitoring is snoozed for today'
  data.bodyText = 'Unsnooze trip monitoring to see the updated status'
  data.shouldRenderAlerts = false
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
