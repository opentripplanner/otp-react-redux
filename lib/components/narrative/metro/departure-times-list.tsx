import { FormattedList, FormattedTime, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
import { getDepartureLabelText } from '../utils'
import {
  getFirstLegStartTime,
  getLastLegEndTime
} from '../../../util/itinerary'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

type DepartureTimesProps = {
  itinerary: Itinerary & {
    allStartTimes: {
      legs: Leg[]
      realtime: boolean
    }[]
  }
  setActiveItinerary: (payload: { index: number }) => void
  showArrivals?: boolean
}

export const DepartureTimesList = ({
  itinerary,
  setActiveItinerary,
  showArrivals
}: DepartureTimesProps): JSX.Element => {
  const intl = useIntl()
  const isRealTime = firstTransitLegIsRealtime(itinerary)
  const itineraryButtonLabel = getDepartureLabelText(
    intl,
    itinerary.startTime,
    isRealTime
  )
  if (!itinerary.allStartTimes) {
    return (
      <>
        <span
          aria-hidden
          className={isRealTime ? 'realtime active' : 'active'}
          title={itineraryButtonLabel}
        >
          <FormattedTime value={itinerary.startTime} />
        </span>
        <InvisibleA11yLabel>{itineraryButtonLabel}</InvisibleA11yLabel>
      </>
    )
  }

  const allStartTimes = itinerary.allStartTimes.sort(
    (a, b) => getFirstLegStartTime(a.legs) - getFirstLegStartTime(b.legs)
  )

  return (
    <FormattedList
      type="disjunction"
      value={allStartTimes.map((time, index) => {
        const { itineraryIndex, legs, realtime } = time
        const classNames = []
        if (realtime) classNames.push('realtime')
        if (itineraryIndex === itinerary.index) classNames.push('active')
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
            onClick={() => setActiveItinerary({ index: itineraryIndex })}
            title={singleItinLabel}
          >
            <FormattedTime
              value={
                showArrivals
                  ? getLastLegEndTime(legs)
                  : getFirstLegStartTime(legs)
              }
            />
          </button>
        )
      })}
    />
  )
}
