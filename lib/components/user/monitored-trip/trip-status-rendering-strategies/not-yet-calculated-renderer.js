import React from 'react'
import { FormattedMessage } from 'react-intl'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips where otp-middleware has yet to
 * calculate when the next trip is occurring.
 */
export default function notYetCalculatedTripRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = <FormattedMessage id='components.TripStatusRenderers.notCalculated.heading' />
  data.lastCheckedText = <FormattedMessage id='components.TripStatusRenderers.notCalculated.awaiting' />
  data.bodyText = <FormattedMessage id='components.TripStatusRenderers.notCalculated.description' />
  data.shouldRenderAlerts = false

  return data
}
