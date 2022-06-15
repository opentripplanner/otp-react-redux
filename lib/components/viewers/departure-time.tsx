import { FormattedTime } from 'react-intl'
import addSeconds from 'date-fns/addSeconds'
import React from 'react'

import type { Time } from '../util/types'

interface Props {
  realTime?: boolean
  stopTime: Time
}

/**
 * Displays a formatted departure time (expressed in the agency time zone) for the given stop time.
 */
const DepartureTime = ({ realTime, stopTime }: Props): JSX.Element => {
  // stopTime.serviceDay already corresponds to midnight in the agency's home timezone so no extra conversion is needed.
  const startOfDate = new Date(stopTime.serviceDay * 1000)
  const departureTimestamp = addSeconds(
    startOfDate,
    realTime ? stopTime.realtimeDeparture : stopTime.scheduledDeparture
  )

  return <FormattedTime timeStyle="short" value={departureTimestamp} />
}

export default DepartureTime
