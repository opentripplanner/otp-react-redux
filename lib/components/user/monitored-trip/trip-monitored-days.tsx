import { FormattedList, FormattedMessage } from 'react-intl'

import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import React from 'react'
import Strong from '../../util/strong-text'

import styled from 'styled-components'

interface Props {
  days: string[]
}

const DayCircleContainer = styled.div`
  display: flex;
  gap: 4px;
`

const MonitoredDay = styled.div<{ monitored: boolean }>`
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background-color: ${(props) => (props.monitored ? '#4152a4' : 'transparent')};
  color: ${(props) => (props.monitored ? 'white' : 'inherit')};
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: capitalize;
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
      <MonitoredDay aria-hidden key={d} monitored={monitored}>
        <span>{dayAbbrev}</span>
      </MonitoredDay>
    )
  })
  return (
    <DayCircleContainer>
      {DayCircles}
      <InvisibleA11yLabel>
        <FormattedMessage
          id="components.TripSummaryPane.happensOnDays"
          values={{ days: monitoredDaysList, strong: Strong }}
        />
      </InvisibleA11yLabel>
    </DayCircleContainer>
  )
}

export default MonitoredDays
