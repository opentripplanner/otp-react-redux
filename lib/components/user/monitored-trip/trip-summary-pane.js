import React from 'react'
import { FormattedList, FormattedMessage } from 'react-intl'

import { dayFieldsToArray } from '../../../util/monitored-trip'

import TripSummary from './trip-summary'

const BoldText = contents => <b>{contents}</b>

/**
 * Displays the summary information of a monitored trip.
 */
const TripSummaryPane = ({ monitoredTrip }) => {
  const { itinerary, leadTimeInMinutes } = monitoredTrip

  if (!itinerary) {
    return (
      <div>
        <FormattedMessage id='components.TripSummaryPane.noItineraryToDisplay' />
      </div>
    )
  } else {
    const days = (
      <FormattedList
        type='conjunction'
        value={dayFieldsToArray(monitoredTrip).map(
          d => <FormattedMessage id={`common.daysOfWeek.${d}`} key={d} />
        )}
      />
    )

    return (
      <>
        {/* TODO: use the modern itinerary summary built for trip comparison. */}
        <TripSummary monitoredTrip={monitoredTrip} />
        <p>
          <FormattedMessage
            id='components.TripSummaryPane.happensOnDays'
            values={{ b: BoldText, days }}
          />
        </p>
        <p>
          <FormattedMessage
            id={`components.TripSummaryPane.notifications${
              monitoredTrip.isActive ? '' : 'Disabled'
            }`}
            values={{ b: BoldText, leadTimeInMinutes }}
          />
        </p>
      </>
    )
  }
}

export default TripSummaryPane
