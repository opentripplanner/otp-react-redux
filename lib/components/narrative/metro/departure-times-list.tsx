import { FormattedList, FormattedTime, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
import { getFirstLegStartTime } from '../../../util/itinerary'

type DepartureTimesProps = {
  activeItineraryTimeIndex?: number
  itinerary: Itinerary & {
    allStartTimes: {
      legs: Leg[]
      realtime: boolean
    }[]
  }
  setItineraryTimeIndex: (index: number) => void
}

export const DepartureTimesList = (props: DepartureTimesProps): JSX.Element => {
  const { activeItineraryTimeIndex, itinerary, setItineraryTimeIndex } = props
  const intl = useIntl()
  const isRealTime = firstTransitLegIsRealtime(itinerary)
  const departureLabelText = (time: any, realTime: boolean) =>
    `${intl.formatTime(time)} ${
      realTime
        ? `(${intl.formatMessage({ id: 'components.StopTimeCell.realtime' })})`
        : `(${intl.formatMessage({ id: 'components.StopTimeCell.scheduled' })})`
    }`
  if (!itinerary.allStartTimes) {
    return (
      <button
        aria-label={departureLabelText(itinerary.startTime, isRealTime)}
        className={isRealTime ? 'realtime active' : 'active'}
        title={departureLabelText(itinerary.startTime, isRealTime)}
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
        return (
          <button
            aria-label={departureLabelText(
              getFirstLegStartTime(legs),
              realtime
            )}
            className={classNames.join(' ')}
            key={getFirstLegStartTime(legs)}
            onClick={() => setItineraryTimeIndex(index)}
            title={departureLabelText(getFirstLegStartTime(legs), realtime)}
          >
            <FormattedTime value={getFirstLegStartTime(time.legs)} />
          </button>
        )
      })}
    />
  )
}
