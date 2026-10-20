import { connect } from 'react-redux'
import { History } from '@styled-icons/fa-solid/History'
import { useIntl, WrappedComponentProps } from 'react-intl'
import React from 'react'

import * as callTakerActions from '../../actions/call-taker'
import { compareEndTimes } from '../../util/call-taker'
import { grey } from '../util/colors'
import { IconWithText } from '../util/styledIcon'

import { WindowHeader } from './styled'
import CallRecord from './call-record'
import DraggableWindow from './draggable-window'

interface Call {
  endTime: string
  queries: any[]
  startTime: string
}

interface DateGroup {
  date: string
  trips: Call[]
}

type Props = {
  callTaker: {
    activeCall: any
    callHistory: {
      calls: Array<any>
      visible: boolean
    }
  }
  searches: Array<any>
  toggleCallHistory: () => null
} & WrappedComponentProps

const containerPadding = { padding: '5px' }

function CallHistoryWindow(props: Props) {
  const intl = useIntl()
  const { callTaker, searches, toggleCallHistory } = props
  const { activeCall, callHistory } = callTaker
  if (!callHistory.visible) return null

  const sortedCalls = callHistory.calls.sort(compareEndTimes)

  // Sort the calls into dates
  const callsByDateArray: Array<DateGroup> = sortedCalls.reduce((acc, call) => {
    const time = intl.formatDate(call.startTime, {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    })

    let dateGroup = acc.find((g: DateGroup) => g.date === time)

    if (!dateGroup) {
      dateGroup = { date: time, trips: [] }
      acc.push(dateGroup)
    }

    dateGroup.trips.push(call)

    return acc
  }, [])

  return (
    <DraggableWindow
      header={
        <WindowHeader>
          <IconWithText Icon={History}>Call history</IconWithText>
        </WindowHeader>
      }
      onClickClose={toggleCallHistory}
      // TODO: Better handle font sizes
      style={{ fontSize: '14px', right: '15px', top: '50px', width: '450px' }}
    >
      {activeCall ? (
        <div style={{ margin: '5px 5px' }}>
          <CallRecord
            call={activeCall}
            inProgress
            intl={intl}
            searches={searches}
          />
        </div>
      ) : null}
      {callsByDateArray.length > 0 ? (
        callsByDateArray.map((day) => (
          <div key={day.date}>
            <div
              style={{
                background: grey[100],
                fontWeight: 'bold',
                ...containerPadding
              }}
            >
              {day.date}
            </div>
            <div style={{ margin: '0 5px' }}>
              {day.trips.map((call: Call, i: number, arr: Call[]) => {
                return (
                  // Create a key so that when call records get added, elements in this list are
                  // recreated/remounted so that they don't show the state from the previous list.
                  <React.Fragment key={`${call.endTime}-${i}`}>
                    <CallRecord call={call} intl={intl} />
                    {i !== arr.length - 1 && <hr style={{ margin: 0 }} />}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        ))
      ) : (
        <div style={containerPadding}>No calls in history</div>
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
  toggleCallHistory: callTakerActions.toggleCallHistory
}

export default connect(mapStateToProps, mapDispatchToProps)(CallHistoryWindow)
