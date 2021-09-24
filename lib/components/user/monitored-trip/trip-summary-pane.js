import React from 'react'
import { FormattedList, FormattedMessage } from 'react-intl'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'

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
        <FormattedMessage id='common.itineraryDescriptions.noItineraryToDisplay' />
      </div>
    )
  } else {
    const days = (
      <FormattedList
        type='conjunction'
        value={dayFieldsToArray(monitoredTrip).map(
          d => <FormattedDayOfWeek day={d} key={d} />
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
          {monitoredTrip.isActive
            ? <FormattedMessage
              id={'components.TripSummaryPane.notifications'}
              values={{ b: BoldText, leadTimeInMinutes }}
            />
            : <FormattedMessage
              id={'components.TripSummaryPane.notificationsDisabled'}
              values={{ b: BoldText, leadTimeInMinutes }}
            />
          }
        </p>
      </>
    )
  }
}

export default TripSummaryPane
