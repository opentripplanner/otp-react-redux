import { FormattedList, FormattedMessage } from 'react-intl'
import React from 'react'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import { MonitoredTrip } from '../types'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import Strong from '../../util/strong-text'

import TripSummary from './trip-summary'

interface Props {
  monitoredTrip: MonitoredTrip
}

/**
 * Displays the summary information of a monitored trip.
 */
const TripSummaryPane = ({ monitoredTrip }: Props): JSX.Element => {
  const { itinerary, leadTimeInMinutes } = monitoredTrip

  if (!itinerary) {
    return (
      <div>
        <FormattedMessage id="common.itineraryDescriptions.noItineraryToDisplay" />
      </div>
    )
  } else {
    const days = (
      <FormattedList
        type="conjunction"
        value={dayFieldsToArray(monitoredTrip).map((d) => (
          <FormattedDayOfWeek day={d} key={d} />
        ))}
      />
    )

    return (
      <>
        {/* TODO: use the modern itinerary summary built for trip comparison. */}
        <TripSummary monitoredTrip={monitoredTrip} />
        <p>
          <FormattedMessage
            id="components.TripSummaryPane.happensOnDays"
            values={{ days, strong: Strong }}
          />
        </p>
        <p>
          {monitoredTrip.isActive ? (
            <FormattedMessage
              id="components.TripSummaryPane.notifications"
              values={{ leadTimeInMinutes, strong: Strong }}
            />
          ) : (
            <FormattedMessage
              id="components.TripSummaryPane.notificationsDisabled"
              values={{ leadTimeInMinutes, strong: Strong }}
            />
          )}
        </p>
      </>
    )
  }
}

export default TripSummaryPane
