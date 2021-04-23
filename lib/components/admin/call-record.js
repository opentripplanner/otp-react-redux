import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import React, { Component } from 'react'

import CallTimeCounter from './call-time-counter'
import Icon from '../narrative/icon'
import QueryRecord from './query-record'
import {CallRecordButton, CallRecordIcon} from './styled'
import {searchToQuery} from '../../util/call-taker'

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
              style={{color: RED, fontSize: '8px', verticalAlign: '2px'}}
              type='circle'
              className='animate-flicker' />
            <CallTimeCounter />
          </div>
          <Icon type='phone' className='fa-flip-horizontal' />{' '}
          [Active call]
          <br />
          <small style={{marginLeft: '20px'}}>
            In progress... click <Icon type='stop' /> to save{' '}
            ({call.searches.length} searches)
          </small>
          <ul className='list-unstyled'>
            {activeQueries.length > 0
              ? activeQueries.map((query, i) => (
                <QueryRecord key={i} query={query} index={i} />
              ))
              : 'No queries recorded.'
            }
          </ul>
        </div>
      )
    }
    // Default (no active call) view
    const startTimeMoment = moment(call.startTime)
    return (
      <div style={{borderBottom: '1px solid grey', margin: '5px 0'}}>
        <CallRecordButton
          className='clear-button-formatting'
          onClick={this._toggleExpanded}
        >
          <CallRecordIcon
            className='fa-flip-horizontal'
            style={{width: '5%'}}
            type='phone' />
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
          ? <ul className='list-unstyled' style={{marginLeft: '22px'}}>
            {call.queries && call.queries.length > 0
              ? call.queries.map((query, i) => (
                <QueryRecord key={i} query={query} index={i} />
              ))
              : 'No queries recorded.'
            }
          </ul>
          : null
        }
      </div>
    )
  }
}
