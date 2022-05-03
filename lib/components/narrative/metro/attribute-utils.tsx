import { FormattedList, FormattedTime } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import React from 'react'

export const departureTimes = (
  itinerary: Itinerary & { allStartTimes: number[] }
): JSX.Element => {
  if (!itinerary.allStartTimes) {
    return <FormattedTime value={itinerary.startTime} />
  }
  const allStartTimes = Array.from(itinerary.allStartTimes).sort()
  return (
    <FormattedList
      type="conjunction"
      value={allStartTimes.map((time) => (
        <FormattedTime key={time} value={time} />
      ))}
    />
  )
}
