import React from 'react'
import { FormattedMessage } from 'react-intl'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips where the next trip isn't
 * possible. The trip might still be possible on other days.
 */
export default function nextTripNotPossibleRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = <FormattedMessage id='components.TripStatusRenderers.nextTripNotPossible.heading' />
  data.bodyText = <FormattedMessage id='components.TripStatusRenderers.nextTripNotPossible.description' />
  data.shouldRenderAlerts = false
  data.shouldRenderPlanNewTripButton = true
  data.shouldRenderTogglePauseTripButton = true

  return data
}
