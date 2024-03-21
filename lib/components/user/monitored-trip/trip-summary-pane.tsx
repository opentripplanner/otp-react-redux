import { FormattedDate, FormattedList, FormattedMessage } from 'react-intl'
import React from 'react'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import { MonitoredTripProps } from '../types'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import Strong from '../../util/strong-text'

import TripSummary from './trip-summary'

/**
 * Displays the summary information of a monitored trip.
 */
const TripSummaryPane = ({
  monitoredTrip
}: MonitoredTripProps): JSX.Element => {
  const { itinerary, leadTimeInMinutes } = monitoredTrip

  if (!itinerary) {
    return (
      <div>
        <FormattedMessage id="common.itineraryDescriptions.noItineraryToDisplay" />
      </div>
    )
  } else {
    const monitoredDays = dayFieldsToArray(monitoredTrip)
    const isOneTime = monitoredDays.length === 0
    // For one-time trips, just print the date the trip is taken.
    // For recurrent trips, print the days the trip will be monitored.
    const days = isOneTime ? (
      <FormattedDate dateStyle="full" value={itinerary.startTime} />
    ) : (
      <FormattedList
        type="conjunction"
        value={monitoredDays.map((d) => (
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
