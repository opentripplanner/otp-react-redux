import { Clock } from '@styled-icons/fa-regular/Clock'
import { connect } from 'react-redux'
import { format, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz'
import { FormattedMessage, useIntl } from 'react-intl'
import { Rss } from '@styled-icons/fa-solid/Rss'
import coreUtils from '@opentripplanner/core-utils'
import isSameDay from 'date-fns/isSameDay'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { getSecondsUntilDeparture, getTripStatus } from '../../util/viewer'
import { StyledIconWrapperTextAlign } from '../util/styledIcon'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
import FormattedDuration from '../util/formatted-duration'
import getRealtimeStatusLabel, {
  status
} from '../util/get-realtime-status-label'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import type { Time } from '../util/types'

import DepartureTime from './departure-time'

const { getUserTimezone } = coreUtils.time
const ONE_HOUR_IN_SECONDS = 3600

const PulsingRss = styled(Rss)`
  animation: pulse-opacity 2s ease-in-out infinite;
  transform: scaleX(-1);
`

type Props = {
  /** If configured, the timezone of the area */
  homeTimezone?: string
  /** Optionally hide countdown unless realtime data is present */
  onlyShowCountdownForRealtime?: boolean
  /** A stopTime object as received from a transit index API */
  stopTime: Time
}

/**
 * Renders a stop time as either schedule or countdown, with an optional status icon.
 * Stop time that apply to a different day have an additional text showing the day of departure.
 */
// eslint-disable-next-line complexity
const StopTimeCell = ({
  homeTimezone = getUserTimezone(),
  onlyShowCountdownForRealtime,
  stopTime
}: Props): JSX.Element => {
  const intl = useIntl()

  if (!homeTimezone || !stopTime) {
    console.warn(
      'Missing required prop(s) for StopTimeCell: homeTimezone, stopTime'
    )
    return (
      <div>
        <FormattedMessage id="common.forms.error" />
      </div>
    )
  }
  if (isNaN(getTimezoneOffset(homeTimezone))) {
    console.warn(`homeTimezone '${homeTimezone}' is invalid`)
    return (
      <div>
        <FormattedMessage id="common.forms.error" />
      </div>
    )
  }

  // Determine whether to show departure as countdown (e.g. "5 min") or as HH:mm
  // time, using realtime updates if available.
  const secondsUntilDeparture = Math.round(
    getSecondsUntilDeparture(stopTime, false)
  )
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown =
    secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture
  // Whether to display "Due" or a countdown (used in conjunction with showCountdown).
  const isDue = secondsUntilDeparture < 60

  const formattedDay = utcToZonedTime(stopTime.serviceDay * 1000, homeTimezone)

  const realtime = stopTime.realtimeState === 'UPDATED'
  const realtimeLabel = realtime
    ? intl.formatMessage({
        id: 'components.StopTimeCell.realtime'
      })
    : intl.formatMessage({
        id: 'components.StopTimeCell.scheduled'
      })
  return (
    <div className="percy-hide">
      <StyledIconWrapperTextAlign
        style={{
          fontSize: '0.6em',
          margin: 0,
          marginRight: 2
        }}
        title={realtimeLabel}
      >
        {realtime ? <PulsingRss /> : <Clock />}
      </StyledIconWrapperTextAlign>

      <span
        className="percy-hide"
        title={getRealtimeStatusLabel({
          intl,
          minutes: Math.abs(Math.ceil(stopTime.departureDelay / 60)),
          status: getTripStatus(realtime, stopTime.departureDelay, 30) as status
        })}
      >
        {/* Not the cleanest boolean, but makes it very clear what we're doing
        in all cases. */}
        {(onlyShowCountdownForRealtime === true && realtime) ||
        (onlyShowCountdownForRealtime === false && showCountdown) ? (
          // Show countdown string (e.g., 3 min or Due)
          isDue ? (
            <FormattedMessage id="components.StopTimeCell.imminentArrival" />
          ) : (
            <FormattedDuration
              duration={secondsUntilDeparture}
              includeSeconds={false}
            />
          )
        ) : (
          <>
            {!isSameDay(new Date(), formattedDay) && (
              <InvisibleA11yLabel>
                <FormattedDayOfWeek
                  // 'iiii' returns the long ISO day of the week (independent of browser locale).
                  // See https://date-fns.org/v2.28.0/docs/format
                  day={format(formattedDay, 'iiii', {
                    timeZone: homeTimezone
                  }).toLowerCase()}
                />{' '}
              </InvisibleA11yLabel>
            )}
            <DepartureTime realTime stopTime={stopTime} />
          </>
        )}
      </span>
    </div>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  return {
    onlyShowCountdownForRealtime:
      state.otp.config?.itinerary?.onlyShowCountdownForRealtime || false
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StopTimeCell)
