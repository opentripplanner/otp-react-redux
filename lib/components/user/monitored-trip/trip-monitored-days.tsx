import { FormattedList, FormattedMessage } from 'react-intl'

import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import React from 'react'

import getBaseColor from '../../util/base-color'

import styled from 'styled-components'

interface Props {
  days: string[]
}

const baseColor = getBaseColor()

const DayCircleContainer = styled.div`
  display: flex;
  gap: 4px;
`

const MonitoredDay = styled.span<{ monitored: boolean }>`
  align-items: center;
  background-color: ${(props) => (props.monitored ? baseColor : 'transparent')};
  border: 1px solid ${(props) => (props.monitored ? baseColor : '#333')};
  border-radius: 50%;
  color: ${(props) => (props.monitored ? 'white' : 'inherit')};
  display: flex;
  height: 27px;
  justify-content: center;
  opacity: ${(props) => (props.monitored ? 1 : 0.7)};
  text-transform: capitalize;
  width: 27px;
`

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

const MonitoredDays = ({ days }: Props) => {
  const monitoredDaysList = (
    <FormattedList
      type="conjunction"
      value={days.map((d) => (
        <FormattedDayOfWeek day={d} key={d} />
      ))}
    />
  )
  const DayCircles = daysOfWeek.map((d) => {
    const dayAbbrev =
      d === 'thursday' || d === 'sunday' ? d.slice(0, 2) : d.charAt(0)
    const monitored = days?.includes(d)
    return (
      <MonitoredDay key={d} monitored={monitored}>
        <span>{dayAbbrev}</span>
      </MonitoredDay>
    )
  })
  return (
    <>
      <InvisibleA11yLabel>
        <FormattedMessage
          id="components.TripSummaryPane.happensOnDays"
          values={{ days: monitoredDaysList }}
        />
      </InvisibleA11yLabel>
      <DayCircleContainer aria-hidden>{DayCircles}</DayCircleContainer>
    </>
  )
}

export default MonitoredDays
