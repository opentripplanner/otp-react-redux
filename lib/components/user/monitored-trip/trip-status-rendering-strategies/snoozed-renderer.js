import React from 'react'
import { FormattedMessage } from 'react-intl'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are have been set to be
 * snoozed for the rest of the day.
 */
export default function snoozedRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = <FormattedMessage id='components.TripStatusRenderers.snoozed.heading' />
  data.bodyText = <FormattedMessage id='components.TripStatusRenderers.snoozed.description' />
  data.shouldRenderAlerts = false
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
