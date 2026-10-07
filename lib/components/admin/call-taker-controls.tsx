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
      fetched: boolean
      visible: boolean
    }
  }
  callTakerEnabled: boolean
  endCall: (intl: IntlShape) => void
  fetchCalls: (intl: IntlShape) => void
  resetAndToggleCallHistory: () => void
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
    const { callTaker, callTakerEnabled, fetchCalls, intl } = this.props
    // Fetch calls.
    if (callTakerEnabled && callTaker.callHistory.fetched === false)
      fetchCalls(intl)
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
    const { callTaker, callTakerEnabled, resetAndToggleCallHistory } =
      this.props
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
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER)
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
