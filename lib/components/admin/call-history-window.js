import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import CallRecord from './call-record'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'
import {WindowHeader} from './styled'

class CallHistoryWindow extends Component {
  render () {
    const {callTaker, fetchQueries, searches, toggleCallHistory} = this.props
    const {activeCall, callHistory} = callTaker
    if (!callHistory.visible) return null
    return (
      <DraggableWindow
        header={<WindowHeader><Icon type='history' /> Call history</WindowHeader>}
        onClickClose={toggleCallHistory}
        style={{right: '15px', top: '50px', width: '450px'}}
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

export default connect(mapStateToProps, mapDispatchToProps)(CallHistoryWindow)
