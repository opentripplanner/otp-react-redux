import { FormattedList, useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { MouseEvent, useCallback } from 'react'

import { firstTransitLegIsRealtime } from '../../../util/viewer'
import { ItineraryStartTime, ItineraryWithIndex } from '../../../util/itinerary'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

const { getItinerarySummaryTiming } = coreUtils.itinerary

export type SetActiveItineraryHandler = (payload: { index: number }) => void

type DepartureTimesProps = {
  expanded?: boolean
  itinerary: ItineraryWithIndex & {
    allStartTimes?: ItineraryStartTime[]
  }
  setActiveItinerary: SetActiveItineraryHandler
  showArrivals?: boolean
  transitOnly?: boolean
}

interface TimeButtonProps {
  active?: boolean
  displayedTime: number
  itinerary: ItineraryWithIndex
  realTime?: boolean
  setActiveItinerary?: SetActiveItineraryHandler
}

const TimeButton = ({
  active,
  displayedTime,
  itinerary,
  realTime,
  setActiveItinerary
}: TimeButtonProps) => {
  const intl = useIntl()
  const classNames = ['timeInfo']
  if (realTime) classNames.push('realtime')
  if (active) classNames.push('active')
  const timeString = intl.formatTime(displayedTime)
  const realtimeStatus = realTime
    ? intl.formatMessage({ id: 'components.StopTimeCell.realtime' })
    : intl.formatMessage({ id: 'components.StopTimeCell.scheduled' })
  const label = `${timeString} (${realtimeStatus})`

  const handleClick = useCallback(
    (e: MouseEvent) => {
      setActiveItinerary && setActiveItinerary(itinerary)
      // Don't let MetroItinerary.handleClick execute, it will set another itinerary as active.
      e.stopPropagation()
    },
    [itinerary, setActiveItinerary]
  )
  // If setActiveItinerary is set, use a button, otherwise render the time as span without interaction.
  const Wrapper = setActiveItinerary ? 'button' : 'span'

  return (
    <Wrapper
      className={classNames.length ? classNames.join(' ') : undefined}
      onClick={setActiveItinerary ? handleClick : undefined}
      title={label}
    >
      {timeString}
      <InvisibleA11yLabel> ({realtimeStatus})</InvisibleA11yLabel>
    </Wrapper>
  )
}

const DepartureTimesList = ({
  expanded,
  itinerary,
  setActiveItinerary,
  showArrivals,
  transitOnly
}: DepartureTimesProps): JSX.Element => {
  const summaryTiming = getItinerarySummaryTiming(itinerary, transitOnly)
  if (!itinerary.allStartTimes) {
    return (
      <TimeButton
        active
        displayedTime={
          showArrivals ? summaryTiming.endTime : summaryTiming.startTime
        }
        itinerary={itinerary}
        realTime={firstTransitLegIsRealtime(itinerary)}
        setActiveItinerary={expanded ? undefined : setActiveItinerary}
      />
    )
  }

  return (
    <FormattedList
      type="disjunction"
      value={itinerary.allStartTimes.map((time, index) => {
        const { itinerary: itinOption, legs, realtime } = time
        const timing = getItinerarySummaryTiming(
          { ...itinOption, legs },
          transitOnly
        )
        const displayedTime = showArrivals ? timing.endTime : timing.startTime
        return (
          <TimeButton
            active={itinOption.index === itinerary.index}
            displayedTime={displayedTime}
            itinerary={itinOption}
            key={displayedTime}
            realTime={realtime}
            setActiveItinerary={setActiveItinerary}
          />
        )
      })}
    />
  )
}

export default DepartureTimesList
