import { FormattedList, FormattedTime, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React, { MouseEvent } from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
import { getDepartureLabelText } from '../utils'
import {
  getFirstLegStartTime,
  getLastLegEndTime
} from '../../../util/itinerary'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

interface ItineraryWithIndex extends Itinerary {
  index: number
}

type DepartureTimesProps = {
  itinerary: ItineraryWithIndex & {
    allStartTimes?: {
      itinerary: ItineraryWithIndex
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

  return (
    <FormattedList
      type="disjunction"
      value={itinerary.allStartTimes.map((time, index) => {
        const { itinerary: itinOption, legs, realtime } = time
        const classNames = []
        if (realtime) classNames.push('realtime')
        if (itinOption.index === itinerary.index) classNames.push('active')
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
            onClick={(e: MouseEvent) => {
              setActiveItinerary(itinOption)
              // Don't let MetroItinerary.handleClick execute, it will set another itinerary as active.
              e.stopPropagation()
            }}
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
