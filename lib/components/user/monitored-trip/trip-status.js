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
  deleteUserMonitoredTrip,
  planNewTripFromMonitoredTrip,
  togglePauseTrip,
  toggleSnoozeTrip
} from '../../../actions/user'
import getRenderingStrategy from './trip-status-rendering-strategies'

const StyledFooterButton = styled(Button)`
  margin-right: 10px;
`

export function FooterButton ({ bsStyle, glyphIcon, onClick, text }) {
  return (
    <StyledFooterButton bsStyle={bsStyle} onClick={onClick}>
      <><Glyphicon glyph={glyphIcon} /> {text}</>
    </StyledFooterButton>
  )
}

function MonitoredTripAlerts ({ alerts, longDateFormat, timeFormat }) {
  let alertsHeader
  if (alerts.length === 1) {
    alertsHeader = `${alerts.length} alert exists for this trip!`
  } else {
    alertsHeader = `${alerts.length} alerts exist for this trip!`
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

function TripStatus ({
  deleteUserMonitoredTrip,
  longDateFormat,
  planNewTripFromMonitoredTrip,
  renderingStrategy,
  timeFormat,
  togglePauseTrip,
  toggleSnoozeTrip
}) {
  if (!renderingStrategy.shouldRender()) return null

  return (
    <Panel bsStyle={renderingStrategy.getPanelBsStyle()}>
      {/* Heading */}
      <Panel.Heading>
        <h3>{renderingStrategy.getHeadingText()}</h3>
        <h6>{renderingStrategy.getLastCheckedText()}</h6>
      </Panel.Heading>
      {/* Body */}
      <Panel.Body>{renderingStrategy.getBodyText()}</Panel.Body>
      {/* Alerts */}
      {renderingStrategy.shouldRenderAlerts() && (
        <MonitoredTripAlerts
          alerts={renderingStrategy.getAlerts()}
          longDateFormat={longDateFormat}
          timeFormat={timeFormat}
        />
      )}
      {/* Footer buttons */}
      <Panel.Body>
        {renderingStrategy.shouldRenderToggleSnoozeTripButton() && (
          <FooterButton
            glyphIcon={renderingStrategy.getToggleSnoozeTripButtonGlyphIcon()}
            onClick={toggleSnoozeTrip}
            text={renderingStrategy.getToggleSnoozeTripButtonText()}
          />
        )}
        {renderingStrategy.shouldRenderTogglePauseTripButton() && (
          <FooterButton
            glyphIcon={renderingStrategy.getTogglePauseTripButtonGlyphIcon()}
            onClick={togglePauseTrip}
            text={renderingStrategy.getTogglePauseTripButtonText()}
          />
        )}
        {renderingStrategy.shouldRenderDeleteTripButton() && (
          <FooterButton
            bsStyle='error'
            glyphIcon='trash'
            onClick={deleteUserMonitoredTrip}
            text='Delete Trip'
          />
        )}
        {renderingStrategy.shouldRenderPlanNewTripButton() && (
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

  const renderingStrategy = getRenderingStrategy({
    dateFormat,
    longDateFormat,
    monitoredTrip,
    timeFormat
  })

  return {
    dateFormat,
    longDateFormat,
    renderingStrategy,
    timeFormat
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { monitoredTrip } = ownProps
  return {
    deleteUserMonitoredTrip: () => dispatch(
      deleteUserMonitoredTrip(monitoredTrip.id)
    ),
    planNewTripFromMonitoredTrip: () => dispatch(
      planNewTripFromMonitoredTrip(monitoredTrip)
    ),
    togglePauseTrip: () => dispatch(togglePauseTrip(monitoredTrip)),
    toggleSnoozeTrip: () => dispatch(toggleSnoozeTrip(monitoredTrip))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
