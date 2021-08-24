import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import React, { Component } from 'react'

import Icon from '../narrative/icon'
import {searchToQuery} from '../../util/call-taker'

import CallTimeCounter from './call-time-counter'
import QueryRecord from './query-record'
import {CallRecordButton, CallRecordIcon, QueryList} from './styled'

/**
 * Displays information for a particular call record in the Call Taker window.
 */
export default class CallRecord extends Component {
  state = {
    expanded: false
  }

  _getCallDuration = () => {
    const {call} = this.props
    const start = moment(call.startTime)
    const end = moment(call.endTime)
    const millis = moment.duration(end.diff(start)).asMilliseconds()
    return humanizeDuration(millis)
  }

  _toggleExpanded = () => {
    const {call, fetchQueries} = this.props
    const {expanded} = this.state
    if (!expanded) fetchQueries(call.id)
    this.setState({expanded: !expanded})
  }

  render () {
    // FIXME: consolidate red color with call taker controls
    const RED = '#C35134'
    const {call, inProgress, searches} = this.props
    const {expanded} = this.state
    if (!call) return null
    if (inProgress) {
      // Map search IDs made during active call to queries.
      const activeQueries = call.searches
        .map(searchId => searchToQuery(searches[searchId], call, {}))
      return (
        <div>
          <div className='pull-right'>
            <Icon
              className='animate-flicker'
              style={{color: RED, fontSize: '8px', verticalAlign: '2px'}}
              type='circle' />
            <CallTimeCounter />
          </div>
          <Icon className='fa-flip-horizontal' type='phone' />{' '}
          [Active call]
          <br />
          <small style={{marginLeft: '20px'}}>
            In progress... click <Icon type='stop' /> to save{' '}
            ({call.searches.length} searches)
          </small>
          <QueryList>
            {activeQueries.length > 0
              ? activeQueries.map((query, i) => (
                <QueryRecord index={i} key={i} query={query} />
              ))
              : 'No queries recorded.'
            }
          </QueryList>
        </div>
      )
    }
    // Default (no active call) view
    const startTimeMoment = moment(call.startTime)
    return (
      <div style={{borderBottom: '1px solid grey', margin: '5px 0', paddingBottom: '2px'}}>
        <CallRecordButton
          className='clear-button-formatting'
          onClick={this._toggleExpanded}
        >
          <CallRecordIcon className='fa-flip-horizontal' type='phone' />
          <span style={{flex: '0 0 120px'}}>
            {startTimeMoment.format('h:mm a, MMM D')}
          </span>
          <small
            className='text-muted'
            style={{marginLeft: '5px', paddingTop: '2px', width: '60%'}}
          >
            <Icon type='clock-o' />{' '}
            {this._getCallDuration()}
          </small>
        </CallRecordButton>
        {expanded
          ? <QueryList>
            {call.queries && call.queries.length > 0
              ? call.queries.map((query, i) => (
                <QueryRecord index={i} key={i} query={query} />
              ))
              : 'No queries recorded.'
            }
          </QueryList>
          : null
        }
      </div>
    )
  }
}
