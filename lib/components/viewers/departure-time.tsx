import { FormattedTime } from 'react-intl'
import addSeconds from 'date-fns/addSeconds'
import React from 'react'

import type { StopTime, Time } from '../util/types'

interface Props {
  originDate?: Date
  realTime?: boolean
  stopTime: Time | StopTime
}

/**
 * Displays a formatted departure time (expressed in the agency time zone) for the given stop time.
 */
const DepartureTime = ({
  originDate,
  realTime,
  stopTime
}: Props): JSX.Element => {
  // If an originDate is defined, use that, otherwise use stopTime.serviceDay.
  // stopTime.serviceDay already corresponds to midnight in the agency's home timezone so no extra conversion is needed.
  const startOfDate = originDate || new Date(stopTime.serviceDay * 1000)
  const departureTimestamp = addSeconds(
    startOfDate,
    realTime && stopTime.realtimeDeparture
      ? stopTime.realtimeDeparture
      : stopTime.scheduledDeparture
  )

  return <FormattedTime timeStyle="short" value={departureTimestamp} />
}

export default DepartureTime
