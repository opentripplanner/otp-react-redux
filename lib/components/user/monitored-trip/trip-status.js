/* eslint-disable react/prop-types */
import { Alert } from '@opentripplanner/building-blocks'
import { connect } from 'react-redux'
import { ExclamationTriangle } from '@styled-icons/bootstrap/ExclamationTriangle'
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
import { red } from '../../util/colors'

import { ToggleNotificationButton } from './trip-summary-pane'
import getRenderData from './trip-status-rendering-strategies'

const StyledFooterButton = styled(ToggleNotificationButton)``

const StyledButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  button:not(:last-of-type) {
    &::after {
      margin-left: 10px;
      content: '|';
      font-style: normal;
    }
  }
`

const StyledAlertContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
  h3,
  h4 {
    font-size: 16px;
    font-weight: 700;
  }

  ul.alert-body {
    svg {
      display: none;
    }
    li {
      background-color: transparent;
      border-left: 5px solid rgba(0, 0, 0, 0.2);
      margin: 0;
      padding: 0;
      padding-left: 10px;
      border-radius: 0;

      & > * {
        margin-left: 0;
      }
    }
  }
`

export function FooterButton({ onClick, text }) {
  const [loading, setLoading] = useState(false)
  const clickHandler = () => {
    setLoading(true)
    onClick()
  }

  useEffect(() => {
    setLoading(false)
  }, [text])

  return (
    <StyledFooterButton disabled={loading} onClick={clickHandler}>
      {loading ? <InlineLoading /> : text}
    </StyledFooterButton>
  )
}

function MonitoredTripAlerts({ alerts }) {
  return (
    <Alert
      alertHeader={
        <h4>
          <FormattedMessage
            id="components.TripStatus.alerts"
            values={{ alerts: alerts.length }}
          />
        </h4>
      }
      backgroundColor={red[50]}
      collapsible
      Icon={ExclamationTriangle}
    >
      {alerts.map((alert) => (
        <AlertsBody
          agencyName={alert.agencyName}
          alerts={[alert]}
          key={alert.id}
        />
      ))}
    </Alert>
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
  isReadOnly,
  planNewTripFromMonitoredTrip,
  renderData,
  togglePauseTrip,
  toggleSnoozeTrip
}) {
  return (
    <StyledAlertContainer>
      <Alert
        alertHeader={<h4>{renderData.headingText}</h4>}
        alertSubheader={renderData.bodyText}
        backgroundColor={renderData.panelBsStyle}
        Icon={renderData.icon}
      >
        {/* Footer buttons */}
        {!isReadOnly && (
          <StyledButtonContainer>
            {renderData.shouldRenderToggleSnoozeTripButton && (
              <FooterButton
                onClick={toggleSnoozeTrip}
                text={renderData.toggleSnoozeTripButtonText}
              />
            )}
            {renderData.shouldRenderTogglePauseTripButton && (
              <FooterButton
                onClick={togglePauseTrip}
                text={renderData.togglePauseTripButtonText}
              />
            )}
            {renderData.shouldRenderDeleteTripButton && (
              <FooterButton
                onClick={confirmAndDeleteUserMonitoredTrip}
                text={
                  <FormattedMessage id="components.TripStatus.deleteTrip" />
                }
              />
            )}
            {renderData.shouldRenderPlanNewTripButton && (
              <FooterButton
                glyphIcon="search"
                onClick={planNewTripFromMonitoredTrip}
                text={
                  <FormattedMessage id="components.TripStatus.planNewTrip" />
                }
              />
            )}
          </StyledButtonContainer>
        )}
      </Alert>
      {/* Alerts */}
      {renderData.shouldRenderAlerts && (
        <MonitoredTripAlerts alerts={renderData.alerts} />
      )}
    </StyledAlertContainer>
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

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(TripStatus)
)
