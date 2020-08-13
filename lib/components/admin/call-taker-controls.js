import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'
import CallTimeCounter from './call-time-counter'
import Icon from '../narrative/icon'

const RED = '#C35134'
const BLUE = '#1C4D89'
const GREEN = '#6B931B'

/**
 * This component displays the controls for the Call Taker/Field Trip modules,
 * including:
 *  - start/end call button
 *  - view call list
 *  TODO
 *  - view field trip list
 */
class CallTakerControls extends Component {
  componentWillReceiveProps (nextProps) {
    const {session} = nextProps
    // Once session is available, fetch calls.
    if (session && !this.props.session) {
      this.props.fetchCalls()
    }
  }

  _onClickCall = () => {
    if (this._callInProgress()) this.props.endCall()
    else this.props.beginCall()
  }

  _renderCallButton = () => {
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

  _onToggleCallHistory = () => this.props.toggleCallHistory()

  _callInProgress = () => Boolean(this.props.activeCall)

  render () {
    const {session} = this.props
    // If no valid session is found, do not show calltaker controls.
    if (!session) return null
    const circleButtonStyle = {
      position: 'absolute',
      zIndex: 999999,
      color: 'white',
      borderRadius: '50%',
      border: 'none',
      boxShadow: '2px 2px 4px #000000'
    }
    return (
      <>
        {/* Start/End Call button */}
        <button
          style={{
            ...circleButtonStyle,
            top: '154px',
            backgroundColor: this._callInProgress() ? RED : BLUE,
            height: '80px',
            width: '80px',
            marginLeft: '-8px'

          }}
          className='call-taker-button'
          onClick={this._onClickCall}
        >
          {this._renderCallButton()}
        </button>
        {this._callInProgress()
          ? <CallTimeCounter style={{
            display: 'inline',
            position: 'absolute',
            zIndex: 999999,
            top: '241px',
            borderRadius: '20px',
            backgroundColor: BLUE,
            boxShadow: '2px 2px 4px #000000',
            color: 'white',
            fontWeight: '600',
            textAlign: 'center',
            width: '80px',
            marginLeft: '-8px'
          }} />
          : null
        }
        {/* Call History toggle button */}
        <button
          style={{
            ...circleButtonStyle,
            top: '140px',
            backgroundColor: GREEN,
            height: '40px',
            width: '40px',
            marginLeft: '69px'

          }}
          className='call-taker-button'
          onClick={this._onToggleCallHistory}
        >
          <Icon type='history' className='fa-2x' style={{marginLeft: '-3px'}} />
        </button>
        {/* Field Trip toggle button TODO */}
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activeCall: state.callTaker.activeCall,
    session: state.callTaker.session
  }
}

const {beginCall, endCall, fetchCalls, toggleCallHistory} = callTakerActions

const mapDispatchToProps = {
  beginCall,
  endCall,
  fetchCalls,
  routingQuery,
  setMainPanelContent,
  toggleCallHistory
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerControls)
