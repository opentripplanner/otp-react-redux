import { connect } from 'react-redux'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { History } from '@styled-icons/fa-solid/History'
import { injectIntl, IntlShape, WrappedComponentProps } from 'react-intl'
import { Phone } from '@styled-icons/fa-solid/Phone'
import { Plus } from '@styled-icons/fa-solid/Plus'
import { Stop } from '@styled-icons/fa-solid/Stop'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'

import {
  CallHistoryButton,
  CallTimeCounter,
  ControlsContainer,
  FieldTripsButton,
  ToggleCallButton
} from './styled'
import { Icon, StyledIconWrapper } from '../util/styledIcon'

type Props = {
  beginCall: () => void
  callTaker: {
    activeCall: any
    callHistory: {
      calls: {
        data: Array<any>
      }
      visible: boolean
    }
  }
  callTakerEnabled: boolean
  endCall: (intl: IntlShape) => void
  fetchCalls: (intl: IntlShape) => void
  fetchFieldTrips: (intl: IntlShape) => void
  fieldTripEnabled: boolean
  resetAndToggleCallHistory: () => void
  resetAndToggleFieldTrips: () => void
  session: string
} & WrappedComponentProps

/**
 * This component displays the controls for the Call Taker/Field Trip modules,
 * including:
 *  - start/end call button
 *  - view call list
 *  - view field trip list
 */
class CallTakerControls extends Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const {
      callTakerEnabled,
      fetchCalls,
      fetchFieldTrips,
      fieldTripEnabled,
      intl,
      session
    } = this.props
    // Once session is available, fetch calls.
    if (session && !prevProps.session) {
      if (callTakerEnabled) fetchCalls(intl)
      if (fieldTripEnabled) fetchFieldTrips(intl)
    }
  }

  _onClickCall = () => {
    const { beginCall, endCall, intl } = this.props
    if (this._callInProgress()) {
      endCall(intl)
    } else {
      beginCall()
    }
  }

  _renderCallButtonIcon = () => {
    // Show stop button if call not in progress.
    if (this._callInProgress()) {
      return <Icon Icon={Stop} size="4x" style={{ padding: '6px' }} />
    }
    // No call is in progress.
    return (
      <>
        <StyledIconWrapper
          style={{
            marginLeft: '37px',
            marginTop: '16px',
            position: 'absolute'
          }}
        >
          <Plus />
        </StyledIconWrapper>
        <StyledIconWrapper flipHorizontal size="4x">
          <Phone />
        </StyledIconWrapper>
      </>
    )
  }

  _callInProgress = () => Boolean(this.props.callTaker.activeCall)

  render() {
    const {
      callTakerEnabled,
      fieldTripEnabled,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      session
    } = this.props
    // If no valid session is found, do not show calltaker controls.
    if (!session) return null
    return (
      <ControlsContainer>
        {/* Start/End Call button */}
        {callTakerEnabled && (
          <ToggleCallButton
            callInProgress={this._callInProgress()}
            className="call-taker-button"
            onClick={this._onClickCall}
          >
            {this._renderCallButtonIcon()}
          </ToggleCallButton>
        )}
        {this._callInProgress() ? <CallTimeCounter /> : null}
        {/* Call History toggle button */}
        {callTakerEnabled && (
          <CallHistoryButton
            className="call-taker-button"
            onClick={resetAndToggleCallHistory}
          >
            <StyledIconWrapper size="2x">
              <History />
            </StyledIconWrapper>
          </CallHistoryButton>
        )}
        {/* Field Trip toggle button */}
        {fieldTripEnabled && (
          <FieldTripsButton
            className="call-taker-button"
            onClick={resetAndToggleFieldTrips}
          >
            <StyledIconWrapper size="2x">
              <GraduationCap />
            </StyledIconWrapper>
          </FieldTripsButton>
        )}
      </ControlsContainer>
    )
  }
}

const mapStateToProps = (state: Record<string, any>) => {
  return {
    callTaker: state.callTaker,
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    session: state.callTaker.session
  }
}

const mapDispatchToProps = {
  beginCall: callTakerActions.beginCall,
  endCall: callTakerActions.endCall,
  fetchCalls: callTakerActions.fetchCalls,
  fetchFieldTrips: fieldTripActions.fetchFieldTrips,
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  routingQuery: apiActions.routingQuery,
  setMainPanelContent: uiActions.setMainPanelContent
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CallTakerControls))
