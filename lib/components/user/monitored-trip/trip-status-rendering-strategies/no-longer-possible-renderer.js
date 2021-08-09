import React from 'react'
import { FormattedMessage } from 'react-intl'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are no longer possible after
 * otp-middleware was unable to find a matching itinerary for a whole week.
 */
export default function noLongerPossibleRenderer (monitoredTrip) {
  const data = baseRenderer(monitoredTrip)

  data.headingText = <FormattedMessage id='components.TripStatusRenderers.noLongerPossible.heading' />
  data.bodyText = <FormattedMessage id='components.TripStatusRenderers.noLongerPossible.description' />
  data.shouldRenderAlerts = false
  data.shouldRenderDeleteTripButton = true
  data.shouldRenderPlanNewTripButton = true

  return data
}
