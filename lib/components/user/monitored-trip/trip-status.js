import {
  getDateFormat,
  getLongDateFormat,
  getTimeFormat
} from '@opentripplanner/core-utils/lib/time'
import AlertsBody from '@opentripplanner/itinerary-body/lib/TransitLegBody/alerts-body'
import React from 'react'
import { Button, Glyphicon, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  confirmAndDeleteUserMonitoredTrip,
  planNewTripFromMonitoredTrip,
  togglePauseTrip,
  toggleSnoozeTrip
} from '../../../actions/user'
import getRenderData from './trip-status-rendering-strategies'

const StyledFooterButton = styled(Button)`
  margin-right: 10px;
`

export function FooterButton ({ bsStyle, glyphIcon, onClick, text }) {
  return (
    <StyledFooterButton bsStyle={bsStyle} onClick={onClick}>
      <Glyphicon glyph={glyphIcon} /> {text}
    </StyledFooterButton>
  )
}

function MonitoredTripAlerts ({ alerts, longDateFormat, timeFormat }) {
  let alertsHeader
  if (alerts.length === 1) {
    alertsHeader = `${alerts.length} alert!`
  } else {
    alertsHeader = `${alerts.length} alerts!`
  }

  return (
    <Panel.Body>
      <h4>{alertsHeader}</h4>
      <AlertsBody
        alerts={alerts}
        longDateFormat={longDateFormat}
        timeFormat={timeFormat}
      />
    </Panel.Body>
  )
}

/**
 * A functional component that is used to display summary information about a
 * certain monitored trip. It is expected that the renderData for the trip is
 * passed to this component with the necessary data for rendering each portion
 * of this component.
 */
function TripStatus ({
  confirmAndDeleteUserMonitoredTrip,
  longDateFormat,
  planNewTripFromMonitoredTrip,
  renderData,
  timeFormat,
  togglePauseTrip,
  toggleSnoozeTrip
}) {
  return (
    <Panel bsStyle={renderData.panelBsStyle}>
      {/* Heading */}
      <Panel.Heading>
        <h3>{renderData.headingText}</h3>
        <small>{renderData.lastCheckedText}</small>
      </Panel.Heading>
      {/* Body */}
      <Panel.Body>{renderData.bodyText}</Panel.Body>
      {/* Alerts */}
      {renderData.shouldRenderAlerts && (
        <MonitoredTripAlerts
          alerts={renderData.alerts}
          longDateFormat={longDateFormat}
          timeFormat={timeFormat}
        />
      )}
      {/* Footer buttons */}
      <Panel.Body>
        {renderData.shouldRenderToggleSnoozeTripButton && (
          <FooterButton
            glyphIcon={renderData.toggleSnoozeTripButtonGlyphIcon}
            onClick={toggleSnoozeTrip}
            text={renderData.toggleSnoozeTripButtonText}
          />
        )}
        {renderData.shouldRenderTogglePauseTripButton && (
          <FooterButton
            glyphIcon={renderData.togglePauseTripButtonGlyphIcon}
            onClick={togglePauseTrip}
            text={renderData.togglePauseTripButtonText}
          />
        )}
        {renderData.shouldRenderDeleteTripButton && (
          <FooterButton
            bsStyle='error'
            glyphIcon='trash'
            onClick={confirmAndDeleteUserMonitoredTrip}
            text='Delete Trip'
          />
        )}
        {renderData.shouldRenderPlanNewTripButton && (
          <FooterButton
            glyphIcon='search'
            onClick={planNewTripFromMonitoredTrip}
            text='Plan New Trip'
          />
        )}
      </Panel.Body>
    </Panel>
  )
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const { monitoredTrip } = ownProps
  const dateFormat = getDateFormat(state.otp.config)
  const longDateFormat = getLongDateFormat(state.otp.config)
  const timeFormat = getTimeFormat(state.otp.config)

  const renderData = getRenderData({
    dateFormat,
    longDateFormat,
    monitoredTrip,
    onTimeThresholdSeconds: state.otp.config.onTimeThresholdSeconds,
    timeFormat
  })

  return {
    dateFormat,
    longDateFormat,
    renderData,
    timeFormat
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { monitoredTrip } = ownProps
  return {
    confirmAndDeleteUserMonitoredTrip: () => dispatch(
      confirmAndDeleteUserMonitoredTrip(monitoredTrip.id)
    ),
    planNewTripFromMonitoredTrip: () => dispatch(
      planNewTripFromMonitoredTrip(monitoredTrip)
    ),
    togglePauseTrip: () => dispatch(togglePauseTrip(monitoredTrip)),
    toggleSnoozeTrip: () => dispatch(toggleSnoozeTrip(monitoredTrip))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
