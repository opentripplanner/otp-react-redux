import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import Icon from '../narrative/icon'
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
      session
    } = this.props
    // Once session is available, fetch calls.
    if (session && !prevProps.session) {
      if (callTakerEnabled) fetchCalls()
      if (fieldTripEnabled) fetchFieldTrips()
    }
  }

  _onClickCall = () => {
    if (this._callInProgress()) this.props.endCall()
    else this.props.beginCall()
  }

  _renderCallButtonIcon = () => {
    // Show stop button if call not in progress.
    if (this._callInProgress()) {
      return (
        <Icon type='stop' style={{marginLeft: '3px'}} className='fa-3x' />
      )
    }
    // No call is in progress.
    return (
      <>
        <Icon
          type='plus'
          style={{
            position: 'absolute',
            marginLeft: '17px',
            marginTop: '6px'
          }} />
        <Icon type='phone' className='fa-4x fa-flip-horizontal' />
      </>
    )
  }

  _callInProgress = () => Boolean(this.props.callTaker.activeCall)

  render () {
    const {
      callTakerEnabled,
      fieldTripEnabled,
      session,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips
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
    callTakerEnabled: Boolean(state.otp.config.modules.find(m => m.id === 'call')),
    fieldTripEnabled: Boolean(state.otp.config.modules.find(m => m.id === 'ft')),
    session: state.callTaker.session
  }
}

const mapDispatchToProps = {
  beginCall: callTakerActions.beginCall,
  endCall: callTakerActions.endCall,
  fetchCalls: callTakerActions.fetchCalls,
  fetchFieldTrips: fieldTripActions.fetchFieldTrips,
  routingQuery: apiActions.routingQuery,
  setMainPanelContent: uiActions.setMainPanelContent,
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerControls)
