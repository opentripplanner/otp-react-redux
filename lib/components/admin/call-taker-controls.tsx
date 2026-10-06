import { connect } from 'react-redux'
import { History } from '@styled-icons/fa-solid/History'
import { injectIntl, IntlShape, WrappedComponentProps } from 'react-intl'
import { Phone } from '@styled-icons/fa-solid/Phone'
import { Stop } from '@styled-icons/fa-solid/Stop'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as uiActions from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'
import { NavbarButton } from '../app/nav-item'
import { StyledIconWrapper } from '../util/styledIcon'

import { ControlsContainer, ToggleCallButton } from './styled'

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
  resetAndToggleCallHistory: () => void
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
    const { callTakerEnabled, fetchCalls, intl, session } = this.props
    // Once session is available, fetch calls.
    if (session && !prevProps.session) {
      if (callTakerEnabled) fetchCalls(intl)
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

  _callInProgress = () => Boolean(this.props.callTaker.activeCall)

  render() {
    const { callTaker, callTakerEnabled, resetAndToggleCallHistory, session } =
      this.props
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
            <StyledIconWrapper flipHorizontal>
              {this._callInProgress() ? <Stop /> : <Phone />}
            </StyledIconWrapper>
          </ToggleCallButton>
        )}
        {/* Call History toggle button */}
        {callTakerEnabled && (
          <NavbarButton
            className="call-taker-button"
            onClick={resetAndToggleCallHistory}
          >
            <StyledIconWrapper>
              <History />
            </StyledIconWrapper>
          </NavbarButton>
        )}
      </ControlsContainer>
    )
  }
}

const mapStateToProps = (state: Record<string, any>) => {
  return {
    callTaker: state.callTaker,
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    session: state.callTaker.session
  }
}

const mapDispatchToProps = {
  beginCall: callTakerActions.beginCall,
  endCall: callTakerActions.endCall,
  fetchCalls: callTakerActions.fetchCalls,
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  routingQuery: apiActions.routingQuery,
  setMainPanelContent: uiActions.setMainPanelContent
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CallTakerControls))
