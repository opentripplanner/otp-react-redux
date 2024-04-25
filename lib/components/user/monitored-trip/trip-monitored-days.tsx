import { FormattedList, FormattedMessage, useIntl } from 'react-intl'

import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import React from 'react'

import { ALL_DAYS } from '../../../util/monitored-trip'
import { getBaseColor } from '../../util/base-color'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import FormattedDayOfWeekCompact from '../../util/formatted-day-of-week-compact'

import styled from 'styled-components'

interface Props {
  days: string[]
}

const DayCircleContainer = styled.div`
  display: flex;
  gap: 4px;
`

const MonitoredDayCircle = styled.span<{
  baseColor: string
  monitored: boolean
}>`
  align-items: center;
  background-color: ${(props) =>
    props.monitored ? props.baseColor : `${props.baseColor}20`};
  border-radius: 50%;
  color: ${(props) => (props.monitored ? 'white' : 'inherit')};
  display: flex;
  height: 3rem;
  justify-content: center;
  opacity: ${(props) => (props.monitored ? 1 : 0.7)};
  text-transform: capitalize;
  width: 3rem;

  span {
    font-family: 'SF Pro Display', 'Inter', sans-serif;
    margin-top: 1px;
  }
`

const MonitoredDays = ({ days }: Props) => {
  const monitoredDaysList = (
    <FormattedList
      type="conjunction"
      value={days.map((d) => (
        <FormattedDayOfWeek day={d} key={d} />
      ))}
    />
  )

  const baseColor = getBaseColor()
  const DayCircles = ALL_DAYS.map((d) => {
    const dayAbbrev = <FormattedDayOfWeekCompact day={d} />
    const monitored = days?.includes(d)
    return (
      <MonitoredDayCircle baseColor={baseColor} key={d} monitored={monitored}>
        <span>{dayAbbrev}</span>
      </MonitoredDayCircle>
    )
  })
  return (
    <>
      <DayCircleContainer aria-hidden>{DayCircles}</DayCircleContainer>
      <InvisibleA11yLabel>
        <FormattedMessage
          id="components.TripSummaryPane.happensOnDays"
          values={{ days: monitoredDaysList }}
        />
      </InvisibleA11yLabel>
    </>
  )
}

export default MonitoredDays
