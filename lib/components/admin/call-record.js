import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as formActions from '../../actions/form'
import CallTimeCounter from './call-time-counter'
import Icon from '../narrative/icon'

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
    const {call, index, inProgress} = this.props
    const {expanded} = this.state
    if (!call) {
      console.warn('no call found?', this.props)
    }
    if (inProgress) {
      return (
        <div>
          <div className='pull-right'>
            <Icon
              style={{color: RED, fontSize: '8px', verticalAlign: '2px'}}
              type='circle'
              className='animate-flicker' />
            <CallTimeCounter
              style={{display: 'inline'}}
              // FIXME For some reason this counter is not updating...
              name='call-history-counter' />
          </div>
          <Icon type='phone' className='fa-flip-horizontal' /> [Active call]<br />
          <small style={{marginLeft: '20px'}}>In progress... click <Icon type='stop' />  to save ({call.searches.length} searches)</small>
          <div>
            {call.queries
              ? call.queries.map((query, i) => (
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
        <button style={{width: '100%'}} className='clear-button-formatting' onClick={this._toggleExpanded}>
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

let counter = 1

class QueryRecordLayout extends Component {
  _viewQuery = () => {
    const {parseUrlQueryString, query} = this.props
    const params = JSON.parse(query.queryParams)
    console.log(params)
    if ('arriveBy' in params) {
      params.departArrive = params.arriveBy ? 'ARRIVE' : 'DEPART'
    }
    parseUrlQueryString(params, counter++)
  }

  render () {
    const {index} = this.props
    return (
      <div>
        <button onClick={this._viewQuery} className='clear-button-formatting'>
          <Icon type='search' />
        </button>{' '}
        Query {index + 1}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activeCall: state.callTaker.activeCall
  }
}

const {parseUrlQueryString} = formActions

const mapDispatchToProps = { parseUrlQueryString }

const QueryRecord = connect(mapStateToProps, mapDispatchToProps)(QueryRecordLayout)
