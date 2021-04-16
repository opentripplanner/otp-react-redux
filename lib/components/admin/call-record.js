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
    const startTimeMoment = moment(call.startTime)
    const endTimeMoment = moment(call.endTime)
    const [hours, minutes, seconds] = moment.utc(
      moment.duration(endTimeMoment.diff(startTimeMoment)).asMilliseconds()
    ).format('HH:mm:ss').split(':').map(val => +val)
    const parts = []
    if (hours) parts.push(`${hours} hr`)
    if (minutes) parts.push(`${minutes} min`)
    if (seconds) parts.push(`${seconds} sec`)
    return parts.join(', ')
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
            type='phone'
            className='fa-flip-horizontal' />
          <div>
            {startTimeMoment.format('h:mm a, MMM D')}<br />
            (Length: {this._getCallDuration()})
          </div>
        </CallRecordButton>
        {expanded
          ? <ul className='list-unstyled'>
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
