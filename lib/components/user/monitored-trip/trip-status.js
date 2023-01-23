/* eslint-disable react/prop-types */
import { Button, Glyphicon, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import AlertsBody from '@opentripplanner/itinerary-body/lib/TransitLegBody/alerts-body'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import {
  confirmAndDeleteUserMonitoredTrip,
  planNewTripFromMonitoredTrip,
  togglePauseTrip,
  toggleSnoozeTrip
} from '../../../actions/user'
import { InlineLoading } from '../../narrative/loading'

import getRenderData from './trip-status-rendering-strategies'

const StyledFooterButton = styled(Button)`
  margin-right: 10px;
`

export function FooterButton({ bsStyle, glyphIcon, onClick, text }) {
  const [loading, setLoading] = useState(false)
  const clickHandler = () => {
    setLoading(true)
    onClick()
  }

  useEffect(() => {
    setLoading(false)
  }, [text])

  return (
    <StyledFooterButton
      bsStyle={bsStyle}
      disabled={loading}
      onClick={clickHandler}
    >
      {loading ? (
        <InlineLoading />
      ) : (
        <>
          <Glyphicon glyph={glyphIcon} /> {text}
        </>
      )}
    </StyledFooterButton>
  )
}

function MonitoredTripAlerts({ alerts }) {
  return (
    <Panel.Body>
      <h4>
        <FormattedMessage
          id="components.TripStatus.alerts"
          values={{ alerts: alerts.length }}
        />
      </h4>
      <AlertsBody alerts={alerts} />
    </Panel.Body>
  )
}

/**
 * A functional component that is used to display summary information about a
 * certain monitored trip. It is expected that the renderData for the trip is
 * passed to this component with the necessary data for rendering each portion
 * of this component.
 */
function TripStatus({
  confirmAndDeleteUserMonitoredTrip,
  planNewTripFromMonitoredTrip,
  renderData,
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
        <MonitoredTripAlerts alerts={renderData.alerts} />
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
            bsStyle="error"
            glyphIcon="trash"
            onClick={confirmAndDeleteUserMonitoredTrip}
            text={<FormattedMessage id="components.TripStatus.deleteTrip" />}
          />
        )}
        {renderData.shouldRenderPlanNewTripButton && (
          <FooterButton
            glyphIcon="search"
            onClick={planNewTripFromMonitoredTrip}
            text={<FormattedMessage id="components.TripStatus.planNewTrip" />}
          />
        )}
      </Panel.Body>
    </Panel>
  )
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const { monitoredTrip } = ownProps
  const renderData = getRenderData({
    monitoredTrip,
    onTimeThresholdSeconds: state.otp.config.onTimeThresholdSeconds
  })

  return {
    renderData
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { intl, monitoredTrip } = ownProps
  return {
    confirmAndDeleteUserMonitoredTrip: () =>
      dispatch(confirmAndDeleteUserMonitoredTrip(monitoredTrip.id, intl)),
    planNewTripFromMonitoredTrip: () =>
      dispatch(planNewTripFromMonitoredTrip(monitoredTrip)),
    togglePauseTrip: () => dispatch(togglePauseTrip(monitoredTrip, intl)),
    toggleSnoozeTrip: () => dispatch(toggleSnoozeTrip(monitoredTrip, intl))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripStatus))
