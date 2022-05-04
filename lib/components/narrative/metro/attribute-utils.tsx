import { FormattedList, FormattedTime } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import React from 'react'

import { containsRealtimeLeg } from '../../../util/viewer'

export const departureTimes = (
  itinerary: Itinerary & {
    allStartTimes: { realtime: boolean; time: number }[]
  }
): JSX.Element => {
  if (!itinerary.allStartTimes) {
    return (
      <span className={containsRealtimeLeg(itinerary) ? 'realtime' : ''}>
        <FormattedTime value={itinerary.startTime} />
      </span>
    )
  }
  const allStartTimes = Array.from(itinerary.allStartTimes).sort(
    (a, b) => a.time - b.time
  )
  return (
    <FormattedList
      type="conjunction"
      value={allStartTimes.map((time) => (
        <span className={time.realtime ? 'realtime' : ''} key={time.time}>
          <FormattedTime key={time.time} value={time.time} />
        </span>
      ))}
    />
  )
}
