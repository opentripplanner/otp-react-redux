import React from 'react'
import { FormattedMessage } from 'react-intl'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are have been set to an
 * inactive state by a user.
 */
export default function inactiveRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = <FormattedMessage id='components.TripStatusRenderers.inactive.heading' />
  data.bodyText = <FormattedMessage id='components.TripStatusRenderers.inactive.description' />
  data.shouldRenderAlerts = false
  data.shouldRenderTogglePauseTripButton = true

  return data
}
