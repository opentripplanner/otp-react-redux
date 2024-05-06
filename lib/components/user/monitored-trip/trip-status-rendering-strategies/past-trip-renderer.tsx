import { FormattedMessage } from 'react-intl'
import React from 'react'

import { MonitoredTrip, MonitoredTripRenderData } from '../../types'

import baseRenderer from './base-renderer'

/**
 * Rendering info for a one-time trip in the past.
 */
export default function pastTripRenderer(
  monitoredTrip: MonitoredTrip
): MonitoredTripRenderData {
  const data = baseRenderer(monitoredTrip) as unknown as MonitoredTripRenderData

  data.headingText = (
    <FormattedMessage id="components.TripStatusRenderers.past.heading" />
  )
  data.bodyText = (
    <FormattedMessage id="components.TripStatusRenderers.past.description" />
  )
  data.shouldRenderAlerts = false

  return data
}
