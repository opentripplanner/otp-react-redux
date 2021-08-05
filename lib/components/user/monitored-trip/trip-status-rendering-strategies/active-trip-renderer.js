import moment from 'moment'
import { FormattedMessage } from 'react-intl'

import { getTripStatus, REALTIME_STATUS } from '../../../../util/viewer'
import { FormattedDuration } from '../../../narrative/default/format-duration'

import baseRenderer from './base-renderer'

/**
 * Calculates various data for monitored trips that are currently active.
 */
export default function activeTripRenderer ({
  monitoredTrip,
  onTimeThresholdSeconds,
  timeFormat
}) {
  const data = baseRenderer(monitoredTrip)

  const tripEndMoment = moment(data.matchingItinerary.endTime)

  // analyze whether the journey state indicates that the matching itinerary
  // has realtime data. It is assumed that realtime data will exist for
  // itineraries that have differing values of the scheduled arrival time
  // and matching itinerary arrival time.
  if (data.journeyState.hasRealtimeData) {
    // calculate the deviation from the scheduled arrival time (positive
    // value indicates delay)
    const arrivalDeviationSeconds = (
      data.matchingItinerary.endTime -
      data.journeyState.scheduledArrivalTimeEpochMillis
    ) / 1000
    const tripStatus = getTripStatus(
      true,
      arrivalDeviationSeconds,
      onTimeThresholdSeconds
    )
    if (tripStatus === REALTIME_STATUS.ON_TIME) {
      // about on time
      data.panelBsStyle = 'success'
      data.headingText = <FormattedMessage id='components.ActiveTripRenderer.onTimeHeading' />
    } else if (tripStatus === REALTIME_STATUS.LATE) {
      // delayed
      data.panelBsStyle = 'warning'
      data.headingText = <FormattedMessage
        id='components.ActiveTripRenderer.delayedHeading'
        values={{
          formattedDuration: <FormattedDuration
            values={Math.abs(arrivalDeviationSeconds)}
          />
        }}
      />
    } else {
      // early
      data.panelBsStyle = 'warning'
      data.headingText = <FormattedMessage
        id='components.ActiveTripRenderer.earlyHeading'
        values={{
          formattedDuration: <FormattedDuration
            values={Math.abs(arrivalDeviationSeconds)}
          />
        }}
      />
    }
  } else {
    data.panelBsStyle = 'info'
    data.headingText = <FormattedMessage id='components.ActiveTripRenderer.noDataHeading' />
  }

  data.bodyText = <FormattedMessage
    id='components.ActiveTripRenderer.bodyText'
    values={{arrivalTime: tripEndMoment.format(timeFormat)}}
  />

  data.shouldRenderTogglePauseTripButton = true
  data.shouldRenderToggleSnoozeTripButton = true

  return data
}
