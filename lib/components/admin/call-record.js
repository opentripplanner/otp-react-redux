/* eslint-disable react/prop-types */
import { Circle } from '@styled-icons/fa-solid/Circle'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { differenceInMilliseconds, format } from 'date-fns'
import { Phone } from '@styled-icons/fa-solid/Phone'
import { PhoneAlt } from '@styled-icons/fa-solid/PhoneAlt'
import { Stop } from '@styled-icons/fa-solid/Stop'
import humanizeDuration from 'humanize-duration'
import React, { Component } from 'react'

import {
  IconWithText,
  StyledIconWrapper,
  StyledIconWrapperTextAlign
} from '../util/styledIcon'
import { parseDate, searchToQuery } from '../../util/call-taker'
import { RED_ON_WHITE } from '../util/colors'

import { CallRecordHeader, QueryList } from './styled'
import CallTimeCounter from './call-time-counter'
import QueryRecord from './query-record'

/**
 * Displays information for a particular call record in the Call Taker window.
 */
export default class CallRecord extends Component {
  state = {
    expanded: false
  }

  _getCallDuration = () => {
    const { call } = this.props
    const start = parseDate(call.startTime)
    const end = parseDate(call.endTime)
    const millis = differenceInMilliseconds(end, start)
    return humanizeDuration(millis)
  }

  _toggleExpanded = () => {
    const { expanded } = this.state
    this.setState({ expanded: !expanded })
  }

  render() {
    const { call, inProgress, searches } = this.props
    if (!call) return null
    if (inProgress) {
      // Map search IDs made during active call to queries.
      const activeQueries = call.searches.map((searchId) =>
        searchToQuery(searches[searchId], call, {})
      )
      return (
        <div>
          <div className="pull-right">
            <StyledIconWrapperTextAlign
              className="animate-flicker"
              style={{
                color: RED_ON_WHITE,
                fontSize: '10px',
                verticalAlign: '2px'
              }}
            >
              <Circle />
            </StyledIconWrapperTextAlign>
            <strong>
              <CallTimeCounter startTime={call?.startTime} />
            </strong>
          </div>
          <IconWithText Icon={Phone}>
            <strong>[Active call]</strong>
          </IconWithText>
          <br />
          <div style={{ fontStyle: 'italic', marginLeft: '23px' }}>
            In progress... click{' '}
            <StyledIconWrapper>
              <Stop />
            </StyledIconWrapper>{' '}
            to save ({call.searches.length} searches)
          </div>

          <QueryList>
            {activeQueries.length > 0
              ? activeQueries.map((query, i) => {
                  return <QueryRecord index={i} key={i} query={query} />
                })
              : 'No queries recorded.'}
          </QueryList>
        </div>
      )
    }
    // Default (no active call) view
    const startTime = parseDate(call.startTime)
    return (
      <div>
        <CallRecordHeader className="clear-button-formatting">
          <StyledIconWrapper flipHorizontal>
            <PhoneAlt />
          </StyledIconWrapper>
          <span>
            {format(startTime, 'h:mm a')} - {this._getCallDuration()}
          </span>
        </CallRecordHeader>
        <QueryList>
          {call.queries && call.queries.length > 0
            ? call.queries.map((query, i) => {
                return <QueryRecord index={i} key={i} query={query} />
              })
            : 'No queries recorded.'}
        </QueryList>
      </div>
    )
  }
}
