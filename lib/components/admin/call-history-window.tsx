import { connect } from 'react-redux'
import { History } from '@styled-icons/fa-solid/History'
import { injectIntl, IntlShape, WrappedComponentProps } from 'react-intl'
import React from 'react'

import * as callTakerActions from '../../actions/call-taker'
import { IconWithText } from '../util/styledIcon'

import { WindowHeader } from './styled'
import CallRecord from './call-record'
import DraggableWindow from './draggable-window'

type Props = {
  callTaker: {
    activeCall: any
    callHistory: {
      calls: {
        data: Array<any>
      }
      visible: boolean
    }
  }
  fetchQueries: (callId: string, intl: IntlShape) => void
  searches: Array<any>
  toggleCallHistory: () => null
} & WrappedComponentProps

function CallHistoryWindow(props: Props) {
  const { callTaker, fetchQueries, intl, searches, toggleCallHistory } = props
  const { activeCall, callHistory } = callTaker
  if (!callHistory.visible) return null
  return (
    <DraggableWindow
      header={
        <WindowHeader>
          <IconWithText Icon={History}>Call history</IconWithText>
        </WindowHeader>
      }
      onClickClose={toggleCallHistory}
      style={{ right: '15px', top: '50px', width: '450px' }}
    >
      {activeCall ? (
        <CallRecord
          call={activeCall}
          inProgress
          intl={intl}
          searches={searches}
        />
      ) : null}
      {callHistory.calls.data.length > 0 ? (
        callHistory.calls.data.map((call, i) => (
          <CallRecord
            // Create a key so that when call records get added, elements in this list are
            // recreated/remounted so that they don't show the state from the previous list.
            call={call}
            fetchQueries={fetchQueries}
            intl={intl}
            key={`${call.id}-${i}`}
          />
        ))
      ) : (
        <div>No calls in history</div>
      )}
    </DraggableWindow>
  )
}

const mapStateToProps = (state: Record<string, any>) => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CallHistoryWindow))
