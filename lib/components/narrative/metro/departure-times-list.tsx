import { FormattedList, FormattedTime, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
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
  if (!itinerary.allStartTimes) {
    return (
      <button
        className={isRealTime ? 'realtime active' : 'active'}
        title={`${intl.formatMessage(
          { id: 'components.MetroUI.arriveAtTime' },
          { time: intl.formatTime(itinerary.endTime) }
        )} ${
          isRealTime
            ? intl.formatMessage({ id: 'components.StopTimeCell.realtime' })
            : ''
        }`}
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
        const classNames = []
        if (time.realtime) classNames.push('realtime')
        if (index === (activeItineraryTimeIndex || 0)) classNames.push('active')

        return (
          <button
            className={classNames.join(' ')}
            key={getFirstLegStartTime(time.legs)}
            onClick={() => setItineraryTimeIndex(index)}
            title={`${intl.formatMessage(
              { id: 'components.MetroUI.arriveAtTime' },
              { time: intl.formatTime(getLastLegEndTime(time.legs)) }
            )} ${
              time.realtime
                ? intl.formatMessage({ id: 'components.StopTimeCell.realtime' })
                : ''
            }`}
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
