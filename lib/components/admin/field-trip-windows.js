import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import CallRecord from './call-record'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'

const TABS = [
  {id: 'new', label: 'New', filter: (req) => req.status !== 'cancelled' && (!req.inboundTripStatus || !req.outboundTripStatus)},
  {id: 'planned', label: 'Planned', filter: (req) => req.status !== 'cancelled' && req.inboundTripStatus && req.outboundTripStatus},
  {id: 'cancelled', label: 'Cancelled', filter: (req) => req.status === 'cancelled'},
  {id: 'past', label: 'Past', filter: (req) => req.travelDate && moment(req.travelDate).diff(moment(), 'days') < 0},
  {id: 'all', label: 'All', filter: (req) => true}
]

const SEARCH_FIELDS = [
  'address',
  'ccLastFour',
  'ccName',
  'ccType',
  'checkNumber',
  'city',
  'classpassId',
  'emailAddress',
  'endLocation',
  'grade',
  'phoneNumber',
  'schoolName',
  'startLocation',
  'submitterNotes',
  'teacherName'
]

/**
 * Collects the various draggable windows used in the Call Taker module to
 * display, for example, the call record list and (TODO) the list of field trips.
 */
class FieldTripWindows extends Component {
  _onSearchChange = e => {
    this.props.setFieldTripFilter({search: e.target.value})
  }

  _onTabChange = e => {
    this.props.setFieldTripFilter({tab: e.target.name})
  }

  render () {
    const {callTaker, searches, toggleFieldTrips} = this.props
    const {activeFieldTrip, fieldTrip} = callTaker
    const {filter} = fieldTrip
    const activeTab = TABS.find(tab => tab.id === filter.tab)
    const visibleRequests = fieldTrip.requests.data
      .filter(ft => {
        if (activeTab) return activeTab.filter(ft)
        else return true
      })
      .filter(ft => !filter.search || SEARCH_FIELDS.some(key => {
        const value = ft[key]
        if (value) return value.toLowerCase().indexOf(filter.search.toLowerCase()) !== -1
        else return false
      }))
    return (
      <>
        {fieldTrip.visible
          // Active call window
          ? <DraggableWindow
            draggableProps={{
              defaultPosition: fieldTrip.position
            }}
            header={<span><Icon type='graduation-cap' /> Field Trip Requests</span>}
            onClickClose={toggleFieldTrips}
            style={{width: '450px'}}
          >
            <input
              style={{width: '80px'}}
              placeholder='Search'
              onChange={this._onSearchChange} />
            {TABS.map(tab => {
              const active = tab.id === filter.tab
              const requestCount = fieldTrip.requests.data.filter(tab.filter).length
              return (
                <button
                  key={tab.id}
                  name={tab.id}
                  style={active ? {backgroundColor: 'navy', color: 'white'} : null}
                  className={active ? 'active' : null}
                  onClick={this._onTabChange}
                >
                  {tab.label} {requestCount}
                </button>
              )
            })}
            {activeFieldTrip
              ? <CallRecord
                call={activeFieldTrip}
                searches={searches}
                inProgress />
              : null
            }
            {visibleRequests.length > 0
              ? visibleRequests.map((request, i) => (
                <div key={request.id}>
                  {request.startLocation} to {request.endLocation}
                </div>
              ))
              : <div>No field trips found.</div>
            }
          </DraggableWindow>
          : null
        }
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery,
    searches: state.otp.searches
  }
}

const mapDispatchToProps = {
  fetchQueries: callTakerActions.fetchQueries,
  setFieldTripFilter: callTakerActions.setFieldTripFilter,
  toggleFieldTrips: callTakerActions.toggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldTripWindows)
