import moment from 'moment'
import React, { Component } from 'react'

import CallTimeCounter from './call-time-counter'
import Icon from '../narrative/icon'
import QueryRecord from './query-record'
import {searchToQuery} from '../../util/call-taker'

/**
 * Displays information for a particular call record in the Call Taker window.
 */
export default class CallRecord extends Component {
  state = {
    expanded: false
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
    const {call, index, inProgress, searches} = this.props
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
            <CallTimeCounter style={{display: 'inline'}} />
          </div>
          <Icon type='phone' className='fa-flip-horizontal' />{' '}
          [Active call]
          <br />
          <small style={{marginLeft: '20px'}}>
            In progress... click <Icon type='stop' /> to save{' '}
            ({call.searches.length} searches)
          </small>
          <div>
            {activeQueries.length > 0
              ? activeQueries.map((query, i) => (
                <QueryRecord key={i} query={query} index={i} />
              ))
              : 'No queries recorded.'
            }
          </div>
        </div>
      )
    }
    return (
      <div style={{margin: '5px 0'}}>
        <button
          style={{width: '100%'}}
          className='clear-button-formatting'
          onClick={this._toggleExpanded}
        >
          <Icon type='phone' className='fa-flip-horizontal' />
          Call {index} ({moment(call.endTime).fromNow()})
        </button>
        {expanded
          ? <div>
            {call.queries && call.queries.length > 0
              ? call.queries.map((query, i) => (
                <QueryRecord key={i} query={query} index={i} />
              ))
              : 'No queries recorded.'
            }
          </div>
          : null
        }
      </div>
    )
  }
}
