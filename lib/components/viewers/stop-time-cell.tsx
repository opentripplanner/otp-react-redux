import { CircleXmark } from '@styled-icons/fa-solid/CircleXmark'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { connect } from 'react-redux'
import { format, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz'
import { FormattedMessage, useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import isSameDay from 'date-fns/isSameDay'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { getSecondsUntilDeparture, getTripStatus } from '../../util/viewer'
import { PulsingRss, StyledIconWrapperTextAlign } from '../util/styledIcon'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
import FormattedDuration from '../util/formatted-duration'
import getRealtimeStatusLabel, {
  status
} from '../util/get-realtime-status-label'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import type { Time } from '../util/types'

import DepartureTime from './departure-time'
import StopTimeCellBase from './stop-time-cell-base'

const { getUserTimezone } = coreUtils.time
const ONE_HOUR_IN_SECONDS = 3600

type Props = {
  /** If configured, the timezone of the area */
  homeTimezone?: string
  /** Optionally hide countdown unless realtime data is present */
  onlyShowCountdownForRealtime?: boolean
  /** A stopTime object as received from a transit index API */
  stopTime: Time
  /** Whether to use arrival time instead of departure time */
  useArrivalTime?: boolean
}

const CanceledTripCell = styled(StopTimeCellBase)`
  text-decoration: line-through;
  text-decoration-thickness: 2px;
`

const Error = () => (
  <div>
    <FormattedMessage id="common.forms.error" />
  </div>
)

const CountDown = ({ seconds }: { seconds: number }) => {
  const isDue = seconds < 60
  return isDue ? (
    <FormattedMessage id="components.StopTimeCell.imminentArrival" />
  ) : (
    <FormattedDuration duration={seconds} />
  )
}

const statusMapping = {
  CANCELED: {
    Cell: CanceledTripCell,
    Icon: CircleXmark
  },
  SCHEDULED: {
    Cell: StopTimeCellBase,
    Icon: Clock
  },
  UPDATED: {
    Cell: StopTimeCellBase,
    Icon: PulsingRss
  }
}

/**
 * Renders a stop time as either schedule or countdown, with an optional status icon.
 * Stop time that apply to a different day have an additional text showing the day of departure.
 */
// eslint-disable-next-line complexity
const StopTimeCell = ({
  homeTimezone = getUserTimezone(),
  onlyShowCountdownForRealtime,
  stopTime,
  useArrivalTime
}: Props): JSX.Element => {
  const intl = useIntl()

  if (!homeTimezone || !stopTime) {
    console.warn(
      'Missing required prop(s) for StopTimeCell: homeTimezone, stopTime'
    )
    return <Error />
  }
  if (isNaN(getTimezoneOffset(homeTimezone))) {
    console.warn(`homeTimezone '${homeTimezone}' is invalid`)
    return <Error />
  }

  // Determine whether to show departure as countdown (e.g. "5 min") or as HH:mm
  // time, using realtime updates if available.
  const secondsUntilDeparture = Math.round(
    getSecondsUntilDeparture(stopTime, false, useArrivalTime)
  )
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown =
    secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture

  const formattedDay = utcToZonedTime(stopTime.serviceDay * 1000, homeTimezone)

  const realtime = stopTime.realtimeState === 'UPDATED'
  const realtimeLabel = intl.formatMessage({
    id: `components.StopTimeCell.${stopTime.realtimeState.toLowerCase()}`
  })

  const countdownMode =
    (onlyShowCountdownForRealtime === true && realtime) ||
    (onlyShowCountdownForRealtime === false && showCountdown)

  const Cell = statusMapping[stopTime.realtimeState].Cell
  return (
    <Cell
      Icon={statusMapping[stopTime.realtimeState].Icon}
      status={realtimeLabel}
    >
      {countdownMode ? (
        <CountDown seconds={secondsUntilDeparture} />
      ) : (
        <DepartureTime realTime stopTime={stopTime} />
      )}
    </Cell>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  return {
    onlyShowCountdownForRealtime:
      state.otp.config?.itinerary?.onlyShowCountdownForRealtime || false,
    useArrivalTime: state.otp.config?.nearbyView?.useArrivalTime || false
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StopTimeCell)
