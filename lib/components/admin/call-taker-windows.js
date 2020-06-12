import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Draggable from 'react-draggable'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import CallRecord from './call-record'
import CallTimeCounter from './call-time-counter'
import Icon from '../narrative/icon'

class CallTakerWindows extends Component {
  // FIXME props
  static propTypes = {
    routingType: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func,
    planTrip: PropTypes.func,
    profileTrip: PropTypes.func
  }

  _onCloseCallHistory = () => this.props.toggleCallHistory()

  render () {
    const {callTaker, fetchQueries} = this.props
    const {activeCall, callHistory} = callTaker
    const GREY_BORDER = '#777 1.3px solid'
    return (
      <>
        {callHistory.visible
          // Active call window
          ? <Draggable
            // axis='x'
            handle='.handle'
            defaultPosition={callHistory.position}
            // grid={[25, 25]}
            // scale={1}
            // FIXME: Update position in store on drag?
            // onStart={this.handleStart}
            // onDrag={this.handleDrag}
            // onStop={this.handleStop}
          >
            <div
              style={{
                position: 'absolute',
                zIndex: 9999999,
                width: '350px',
                height: '350px',
                backgroundColor: 'white',
                borderRadius: '5%',
                padding: '10px',
                boxShadow: '2px 2px 8px',
                border: GREY_BORDER
              }}
            >
              <div
                className='handle'
                style={{
                  borderBottom: GREY_BORDER,
                  cursor: 'move',
                  fontSize: 'large',
                  paddingBottom: '5px'
                }}
              >
                <button
                  onClick={this._onCloseCallHistory}
                  className='clear-button-formatting pull-right'>
                  <Icon type='times' />
                </button>
                <Icon type='history' /> Call history
              </div>
              <div>
                {activeCall && <CallRecord call={activeCall} inProgress />}
                {callHistory.calls.data.length > 0
                  ? callHistory.calls.data.map((call, i) => (
                    <CallRecord
                      key={i}
                      index={i}
                      call={call}
                      fetchQueries={fetchQueries} />
                  ))
                  : <div>No calls in history</div>
                }
              </div>
            </div>
          </Draggable>
          : null
        }
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery
  }
}

const {
  fetchQueries,
  toggleCallHistory
} = callTakerActions

const mapDispatchToProps = { fetchQueries, toggleCallHistory }

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerWindows)
