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

import { CallRecordButton, CallRecordIcon, QueryList } from './styled'
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
        searchToQuery(searches[searchId], call, {})
      )
      return (
        <div>
          <div className="pull-right">
            <StyledIconWrapperTextAlign
              className="animate-flicker"
              style={{ color: RED, fontSize: '10px', verticalAlign: '2px' }}
            >
              <Circle />
            </StyledIconWrapperTextAlign>
            <CallTimeCounter />
          </div>
          <IconWithText Icon={Phone}>[Active call]</IconWithText>
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
          <CallRecordIcon flipHorizontal>
            <PhoneAlt />
          </CallRecordIcon>
          <span style={{ flex: '0 0 120px' }}>
            {format(startTime, 'h:mm a, MMM d')}
          </span>
          <small
            className="text-muted"
            style={{ marginLeft: '5px', paddingTop: '2px', width: '60%' }}
          >
            <IconWithText Icon={Clock}>{this._getCallDuration()}</IconWithText>
          </small>
        </CallRecordButton>
        {expanded ? (
          <QueryList>
            {call.queries && call.queries.length > 0
              ? call.queries.map((query, i) => {
                  return <QueryRecord index={i} key={i} query={query} />
                })
              : 'No queries recorded.'}
          </QueryList>
        ) : null}
      </div>
    )
  }
}
