import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import {
  legType,
  timeOptionsType
} from '@opentripplanner/core-utils/lib/types'
import PropTypes from 'prop-types'
import React from 'react'
import { FormattedTime } from 'react-intl'
import styled from 'styled-components'
import { connect } from 'react-redux'

import RealtimeStatusLabel, { DelayText, MainContent } from '../../viewers/realtime-status-label'

const StyledStatusLabel = styled(RealtimeStatusLabel)`
  ${MainContent} {
    font-size: 80%;
    line-height: 1em;
  }
  ${DelayText} {
    display: block;
  }
`
/**
 * This component displays the scheduled departure/arrival time for a leg,
 * and, for transit legs, displays any delays or earliness where applicable.
 */
function RealtimeTimeColumn ({
  homeTimezone,
  isDestination,
  leg,
  timeOptions
}) {
  const time = isDestination ? leg.endTime : leg.startTime
  const isTransitLeg = isTransit(leg.mode)
  const isRealtimeTransitLeg = isTransitLeg && leg.realTime
  // For non-transit legs show only the scheduled time.
  if (!isTransitLeg) {
    return (<div><FormattedTime timeFormat='short' timeZone={homeTimezone} value={time} /></div>)
  }

  const delaySeconds = isDestination ? leg.arrivalDelay : leg.departureDelay
  const originalTimeMillis = time - delaySeconds * 1000

  return (
    <StyledStatusLabel
      delay={delaySeconds}
      isRealtime={isRealtimeTransitLeg}
      originalTime={originalTimeMillis}
      time={time} />
  )
}

RealtimeTimeColumn.propTypes = {
  isDestination: PropTypes.bool.isRequired,
  leg: legType.isRequired,
  timeOptions: timeOptionsType
}

RealtimeTimeColumn.defaultProps = {
  timeOptions: null
}

const mapStateToProps = (state, ownProps) => {
  return {
    homeTimezone: state.otp.config.homeTimezone
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(RealtimeTimeColumn)
