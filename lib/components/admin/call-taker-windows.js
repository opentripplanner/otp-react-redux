import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import CallRecord from './call-record'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'

/**
 * Collects the various draggable windows used in the Call Taker module to
 * display, for example, the call record list and (TODO) the list of field trips.
 */
class CallTakerWindows extends Component {
  render () {
    const {callTaker, fetchQueries, searches, toggleCallHistory} = this.props
    const {activeCall, callHistory} = callTaker
    return (
      <>
        {callHistory.visible
          // Active call window
          ? <DraggableWindow
            draggableProps={{
              defaultPosition: callHistory.position
            }}
            header={<h4><Icon type='history' /> Call history</h4>}
            onClickClose={toggleCallHistory}
          >
            {activeCall
              ? <CallRecord
                call={activeCall}
                searches={searches}
                inProgress />
              : null
            }
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
          </DraggableWindow>
          : null
        }
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery,
    searches: state.otp.searches
  }
}

const mapDispatchToProps = {
  fetchQueries: callTakerActions.fetchQueries,
  toggleCallHistory: callTakerActions.toggleCallHistory
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerWindows)
