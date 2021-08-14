import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import Icon from '../narrative/icon'
import { isModuleEnabled, Modules } from '../../util/config'

import {
  CallHistoryButton,
  CallTimeCounter,
  ControlsContainer,
  FieldTripsButton,
  ToggleCallButton
} from './styled'

/**
 * This component displays the controls for the Call Taker/Field Trip modules,
 * including:
 *  - start/end call button
 *  - view call list
 *  - view field trip list
 */
class CallTakerControls extends Component {
  componentDidUpdate (prevProps) {
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
      if (fieldTripEnabled) fetchFieldTrips()
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
      return (
        <Icon className='fa-3x' style={{marginLeft: '3px'}} type='stop' />
      )
    }
    // No call is in progress.
    return (
      <>
        <Icon
          style={{
            marginLeft: '17px',
            marginTop: '6px',
            position: 'absolute'
          }}
          type='plus' />
        <Icon className='fa-4x fa-flip-horizontal' type='phone' />
      </>
    )
  }

  _callInProgress = () => Boolean(this.props.callTaker.activeCall)

  render () {
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
        {callTakerEnabled &&
          <ToggleCallButton
            callInProgress={this._callInProgress()}
            className='call-taker-button'
            onClick={this._onClickCall}
          >
            {this._renderCallButtonIcon()}
          </ToggleCallButton>
        }
        {this._callInProgress()
          ? <CallTimeCounter />
          : null
        }
        {/* Call History toggle button */}
        {callTakerEnabled &&
          <CallHistoryButton
            className='call-taker-button'
            onClick={resetAndToggleCallHistory}
          >
            <Icon
              className='fa-2x'
              style={{marginLeft: '-3px'}}
              type='history'
            />
          </CallHistoryButton>
        }
        {/* Field Trip toggle button */}
        {fieldTripEnabled &&
          <FieldTripsButton
            className='call-taker-button'
            onClick={resetAndToggleFieldTrips}
          >
            <Icon
              className='fa-2x'
              style={{marginLeft: '2px', marginTop: '3px'}}
              type='graduation-cap'
            />
          </FieldTripsButton>
        }
      </ControlsContainer>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(CallTakerControls)
)
