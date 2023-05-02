import { FormattedList, FormattedTime, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
import { getDepartureLabelText } from '../utils'
import {
  getFirstLegStartTime,
  getLastLegEndTime
} from '../../../util/itinerary'

type DepartureTimesProps = {
  activeItineraryTimeIndex?: number
  itinerary: Itinerary & {
    allStartTimes: {
      legs: Leg[]
      realtime: boolean
    }[]
  }
  setItineraryTimeIndex: (index: number) => void
  showArrivals?: boolean
}

export const DepartureTimesList = (props: DepartureTimesProps): JSX.Element => {
  const {
    activeItineraryTimeIndex,
    itinerary,
    setItineraryTimeIndex,
    showArrivals
  } = props
  const intl = useIntl()
  const isRealTime = firstTransitLegIsRealtime(itinerary)
  const itineraryButtonLabel = getDepartureLabelText(
    intl,
    itinerary.startTime,
    isRealTime
  )
  if (!itinerary.allStartTimes) {
    return (
      <button
        aria-label={itineraryButtonLabel}
        className={isRealTime ? 'realtime active' : 'active'}
        title={itineraryButtonLabel}
      >
        <FormattedTime value={itinerary.startTime} />
      </button>
    )
  }

  const allStartTimes = itinerary.allStartTimes.sort(
    (a, b) => getFirstLegStartTime(a.legs) - getFirstLegStartTime(b.legs)
  )

  return (
    <FormattedList
      type="disjunction"
      value={allStartTimes.map((time, index) => {
        const { legs, realtime } = time
        const classNames = []
        if (realtime) classNames.push('realtime')
        if (index === (activeItineraryTimeIndex || 0)) classNames.push('active')
        const singleItinLabel = getDepartureLabelText(
          intl,
          getFirstLegStartTime(legs),
          realtime
        )
        return (
          <button
            aria-label={singleItinLabel}
            className={classNames.join(' ')}
            key={getFirstLegStartTime(legs)}
            onClick={() => setItineraryTimeIndex(index)}
            title={singleItinLabel}
          >
            <FormattedTime
              value={
                showArrivals
                  ? getLastLegEndTime(time.legs)
                  : getFirstLegStartTime(time.legs)
              }
            />
          </button>
        )
      })}
    />
  )
}
