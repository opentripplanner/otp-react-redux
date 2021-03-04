import moment from 'moment'
import React, { Component } from 'react'
import { Badge } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as fieldTripActions from '../../actions/field-trip'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'
import Loading from '../narrative/loading'
import {FieldTripRecordButton, WindowHeader} from './styled'
import {FETCH_STATUS} from '../../util/constants'

// List of tabs used for filtering field trips.
const TABS = [
  {id: 'new', label: 'New', filter: (req) => req.status !== 'cancelled' && (!req.inboundTripStatus || !req.outboundTripStatus)},
  {id: 'planned', label: 'Planned', filter: (req) => req.status !== 'cancelled' && req.inboundTripStatus && req.outboundTripStatus},
  {id: 'cancelled', label: 'Cancelled', filter: (req) => req.status === 'cancelled'},
  {id: 'past', label: 'Past', filter: (req) => req.travelDate && moment(req.travelDate).diff(moment(), 'days') < 0},
  {id: 'all', label: 'All', filter: (req) => true}
]

// List of fields in field trip object to which user's text search input applies.
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
 * Displays a searchable list of field trip requests in a draggable window.
 */
class FieldTripList extends Component {
  _onClickFieldTrip = (request) => {
    const {callTaker, fetchFieldTripDetails, setActiveFieldTrip} = this.props
    if (request.id === callTaker.fieldTrip.activeId) {
      this._onCloseActiveFieldTrip()
    } else {
      setActiveFieldTrip(request.id)
      fetchFieldTripDetails(request.id)
    }
  }

  _onClickRefresh = () => this.props.fetchFieldTrips()

  _onCloseActiveFieldTrip = () => {
    this.props.setActiveFieldTrip(null)
  }

  /**
   * Change search input selectively. This is to prevent excessive rendering
   * each time the search input changes (on TriMet's production instance there
   * are thousands of field trip requests).
   */
  _handleSearchKeyUp = e => {
    const {callTaker, setFieldTripFilter} = this.props
    const {search} = callTaker.fieldTrip.filter
    const newSearch = e.target.value
    // Update filter if Enter is pressed or search value is entirely cleared.
    const newSearchEntered = e.keyCode === 13 && newSearch !== search
    const searchCleared = search && !newSearch
    if (newSearchEntered || searchCleared) {
      setFieldTripFilter({search: newSearch})
    }
  }

  _onTabChange = e => {
    this.props.setFieldTripFilter({tab: e.currentTarget.name})
  }

  render () {
    const {callTaker, style, toggleFieldTrips} = this.props
    const {fieldTrip} = callTaker
    const {activeId, filter} = fieldTrip
    const {search} = filter
    const activeTab = TABS.find(tab => tab.id === filter.tab)
    const visibleRequests = fieldTrip.requests.data
      .filter(ft => {
        let isVisible = false
        // First, filter field trip on whether it should be visible for the
        // active tab.
        if (activeTab) isVisible = activeTab.filter(ft)
        // If search input is found, only include field trips with at least one
        // field that matches search criteria.
        if (search) {
          // Split the search terms by whitespace and check that the request has
          // values that match every term.
          const searchTerms = search.toLowerCase().split(' ')
          isVisible = searchTerms.every(term => {
            return SEARCH_FIELDS.some(key => {
              const value = (ft[key] || '').toLowerCase()
              let hasMatch = false
              if (value) {
                hasMatch = value.indexOf(term) !== -1
              }
              return hasMatch
            })
          })
        }
        return isVisible
      })
    return (
      <DraggableWindow
        header={
          <>
            <WindowHeader>
              <Icon type='graduation-cap' /> Field Trip Requests{' '}
              <span className='pull-right'>
                <button
                  className='clear-button-formatting'
                  onClick={this._onClickRefresh}
                  style={{marginRight: '5px', verticalAlign: 'bottom'}}
                >
                  <Icon type='refresh' />
                </button>
                <input
                  defaultValue={search}
                  onKeyUp={this._handleSearchKeyUp}
                  placeholder='Press Enter to Search'
                  style={{
                    fontSize: 'revert',
                    fontWeight: 400,
                    marginRight: '15px',
                    width: '140px'
                  }}
                />
              </span>
            </WindowHeader>
            {TABS.map(tab => {
              const active = tab.id === filter.tab
              const style = {
                backgroundColor: active ? 'navy' : undefined,
                borderRadius: 5,
                color: active ? 'white' : undefined,
                padding: '2px 3px'
              }
              const requestCount = fieldTrip.requests.data.filter(tab.filter).length
              return (
                <button
                  className='clear-button-formatting'
                  key={tab.id}
                  name={tab.id}
                  onClick={this._onTabChange}
                  style={style}
                >
                  {tab.label} <Badge>{requestCount}</Badge>
                </button>
              )
            })}
          </>
        }
        onClickClose={toggleFieldTrips}
        style={style}
      >
        {fieldTrip.requests.status === FETCH_STATUS.FETCHING
          ? <Loading />
          : visibleRequests.length > 0
            ? visibleRequests.map((request, i) => (
              <FieldTripRequestRecord
                active={activeId === request.id}
                key={request.id}
                onClick={this._onClickFieldTrip}
                request={request}
              />
            ))
            : <div>No field trips found.</div>
        }
      </DraggableWindow>
    )
  }
}

class FieldTripRequestRecord extends Component {
  _onClick = () => {
    const {onClick, request} = this.props
    onClick(request)
  }

  _getStatusIcon = (status) => status
    ? <Icon type='check' className='text-success' />
    : <Icon type='exclamation-circle' className='text-warning' />

  render () {
    const {active, request} = this.props
    const style = {
      backgroundColor: active ? 'lightgrey' : undefined,
      borderBottom: '1px solid grey'
    }
    const {
      endLocation,
      id,
      inboundTripStatus,
      outboundTripStatus,
      schoolName,
      startLocation,
      teacherName,
      timeStamp
    } = request
    return (
      <li
        className='list-unstyled'
        style={style}
      >
        <FieldTripRecordButton
          className='clear-button-formatting'
          name={id}
          onClick={this._onClick}
        >
          <span style={{display: 'inline-block', fontWeight: 600, width: '50%'}}>
            {schoolName} Trip (#{id})
          </span>
          <span style={{display: 'inline-block', width: '50%'}}>
            <span style={{marginLeft: '10px'}}>
              {this._getStatusIcon(inboundTripStatus)} Inbound
            </span>
            <span style={{marginLeft: '10px'}}>
              {this._getStatusIcon(outboundTripStatus)} Outbound
            </span>
          </span>
          <span style={{display: 'block'}}>
            Submitted by {teacherName} on {timeStamp}
          </span>
          <span style={{display: 'block'}}>
            {startLocation} to {endLocation}
          </span>
        </FieldTripRecordButton>
      </li>
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
  fetchFieldTripDetails: fieldTripActions.fetchFieldTripDetails,
  fetchFieldTrips: fieldTripActions.fetchFieldTrips,
  setActiveFieldTrip: fieldTripActions.setActiveFieldTrip,
  setFieldTripFilter: fieldTripActions.setFieldTripFilter,
  toggleFieldTrips: fieldTripActions.toggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldTripList)
