import React, { Component } from 'react'
import { ControlLabel } from 'react-bootstrap'

import { dayFieldsToArray } from '../../util/monitored-trip'
import TripSummary from './trip-summary'

class TripSummaryPane extends Component {
  render () {
    const { monitoredTrip } = this.props
    const { itinerary } = monitoredTrip

    if (!itinerary) {
      return <div>No itinerary to display.</div>
    } else {
      // TODO: use the modern itinerary summary built for trip comparison.

      // For now, just capitalize the day fields from monitoredTrip.
      const capitalizedDays = dayFieldsToArray(monitoredTrip).map(
        day => `${day.charAt(0).toUpperCase()}${day.substr(1)}`
      )

      return (
        <div>
          <ControlLabel>Selected itinerary:</ControlLabel>
          <TripSummary monitoredTrip={monitoredTrip} />

          <p>Happens on: <b>{capitalizedDays.join(', ')}</b></p>
          <p>Notifications: <b>{monitoredTrip.isActive
            ? `Enabled, ${monitoredTrip.leadTimeInMinutes} min. before scheduled departure`
            : 'Disabled'}</b></p>
          {monitoredTrip.excludeFederalHolidays && <p>Except for US federal holidays</p>}
        </div>
      )
    }
  }
}

export default TripSummaryPane
