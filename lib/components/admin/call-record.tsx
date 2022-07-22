import { Circle, Phone, Stop } from '@styled-icons/fa-solid'
import { Clock } from '@styled-icons/fa-regular'
import { IntlShape, WrappedComponentProps } from 'react-intl'
// @ts-expect-error Not typescripted
import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import React, { Component } from 'react'

import { searchToQuery } from '../../util/call-taker'
import StyledIconWrapper from '../util/styledIcon'

import { CallRecordButton, CallRecordIcon, QueryList } from './styled'
import CallTimeCounter from './call-time-counter'
import QueryRecord from './query-record'

type Props = {
  call: {
    endTime: string
    id: string
    queries: Array<any>
    searches: Array<any>
    startTime: string
  }
  fetchQueries?: (callId: string, intl: IntlShape) => void
  inProgress?: boolean
  searches?: Array<any>
} & WrappedComponentProps

/**
 * Displays information for a particular call record in the Call Taker window.
 */
export default class CallRecord extends Component<Props> {
  state = {
    expanded: false
  }

  _getCallDuration = () => {
    const { call } = this.props
    const start = moment(call.startTime)
    const end = moment(call.endTime)
    const millis = moment.duration(end.diff(start)).asMilliseconds()
    return humanizeDuration(millis)
  }

  _toggleExpanded = () => {
    const { call, fetchQueries, intl } = this.props
    const { expanded } = this.state
    if (!expanded) {
      fetchQueries(call.id, intl)
    }
    this.setState({ expanded: !expanded })
  }

  render() {
    // FIXME: consolidate red color with call taker controls
    const RED = '#C35134'
    const { call, inProgress, searches } = this.props
    const { expanded } = this.state
    if (!call) return null
    if (inProgress) {
      // Map search IDs made during active call to queries.
      const activeQueries = call.searches.map((searchId) =>
        searchToQuery(searches?.[searchId], call, {})
      )
      return (
        <div>
          <div className="pull-right">
            <StyledIconWrapper
              className="animate-flicker"
              spaceRight
              style={{ color: RED, fontSize: '10px', verticalAlign: '2px' }}
            >
              <Circle />
            </StyledIconWrapper>
            <CallTimeCounter />
          </div>
          <StyledIconWrapper spaceRight>
            <Phone />
          </StyledIconWrapper>
          [Active call]
          <br />
          <small style={{ marginLeft: '20px' }}>
            In progress... click{' '}
            <StyledIconWrapper>
              <Stop />
            </StyledIconWrapper>{' '}
            to save ({call.searches.length} searches)
          </small>
          <QueryList>
            {activeQueries.length > 0
              ? activeQueries.map((query, i) => (
                  // eslint-disable-next-line react/jsx-indent
                  <QueryRecord index={i} key={i} query={query} />
                ))
              : 'No queries recorded.'}
          </QueryList>
        </div>
      )
    }
    // Default (no active call) view
    const startTimeMoment = moment(call.startTime)
    return (
      <div
        style={{
          borderBottom: '1px solid grey',
          margin: '5px 0',
          paddingBottom: '2px'
        }}
      >
        <CallRecordButton
          className="clear-button-formatting"
          onClick={this._toggleExpanded}
        >
          <CallRecordIcon className="fa-flip-horizontal" type="phone" />
          <span style={{ flex: '0 0 120px' }}>
            {startTimeMoment.format('h:mm a, MMM D')}
          </span>
          <small
            className="text-muted"
            style={{ marginLeft: '5px', paddingTop: '2px', width: '60%' }}
          >
            <StyledIconWrapper spaceRight>
              <Clock />
            </StyledIconWrapper>
            {this._getCallDuration()}
          </small>
        </CallRecordButton>
        {expanded ? (
          <QueryList>
            {call.queries && call.queries.length > 0
              ? call.queries.map((query, i) => (
                  // eslint-disable-next-line react/jsx-indent
                  <QueryRecord index={i} key={i} query={query} />
                ))
              : 'No queries recorded.'}
          </QueryList>
        ) : null}
      </div>
    )
  }
}
