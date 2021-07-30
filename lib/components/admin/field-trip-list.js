import moment from 'moment'
import qs from 'qs'
import React, { Component } from 'react'
import { Badge, Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as fieldTripActions from '../../actions/field-trip'
import Icon from '../narrative/icon'
import Loading from '../narrative/loading'
import {getVisibleRequests, TABS} from '../../util/call-taker'
import {FETCH_STATUS} from '../../util/constants'

import FieldTripStatusIcon from './field-trip-status-icon'
import {FieldTripRecordButton, WindowHeader} from './styled'
import DraggableWindow from './draggable-window'

/**
 * Displays a searchable list of field trip requests in a draggable window.
 */
class FieldTripList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      date: moment().startOf('day').format('YYYY-MM-DD')
    }
  }
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

  _getReportUrl = () => {
    const {datastoreUrl} = this.props
    const {date} = this.state
    const [year, month, day] = date.split('-')
    const params = {day, month, year}
    return `${datastoreUrl}/fieldtrip/opsReport?${qs.stringify(params)}`
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

  _updateReportDate = evt => this.setState({ date: evt.target.value })

  render () {
    const {callTaker, style, toggleFieldTrips, visibleRequests} = this.props
    const {fieldTrip} = callTaker
    const {activeId, filter} = fieldTrip
    const {search} = filter
    const {date} = this.state
    return (
      <DraggableWindow
        footer={
          <>
            <input
              className='datetime-slim'
              onChange={this._updateReportDate}
              style={{
                border: 'none',
                fontSize: '14px',
                lineHeight: '1em',
                outline: 'none',
                width: '106px'
              }}
              type='date'
              value={date}
            />
            <Button
              bsSize='xsmall'
              href={this._getReportUrl()}
              target='_blank'
            >
              View report
            </Button>
          </>
        }
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
            {TABS.map(tab =>
              <Tab
                data={fieldTrip.requests.data}
                filter={filter}
                key={tab.id}
                onClick={this._onTabChange}
                tab={tab} />
            )}
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

function Tab ({data, filter, onClick, tab}) {
  const count = React.useMemo(() => data.filter(tab.filter).length, [data, tab])
  const active = tab.id === filter.tab
  const style = {
    backgroundColor: active ? 'navy' : undefined,
    borderRadius: 5,
    color: active ? 'white' : undefined,
    padding: '2px 3px'
  }
  return (
    <button
      className='clear-button-formatting'
      key={tab.id}
      name={tab.id}
      onClick={onClick}
      style={style}
    >
      {tab.label} <Badge>{count}</Badge>
    </button>
  )
}

class FieldTripRequestRecord extends Component {
  _onClick = () => {
    const {onClick, request} = this.props
    onClick(request)
  }

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
      timeStamp,
      travelDate
    } = request
    const formattedDate = travelDate.split(' ').splice(0, 3).join(' ')
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
              <FieldTripStatusIcon status={outboundTripStatus} /> Outbound
            </span>
            <span style={{marginLeft: '10px'}}>
              <FieldTripStatusIcon status={inboundTripStatus} /> Inbound
            </span>
          </span>
          <span style={{display: 'block', fontSize: '.9em'}}>
            Submitted by {teacherName} on {timeStamp}
          </span>
          <span style={{display: 'block', fontSize: '.9em'}}>
            {startLocation} to {endLocation} on <strong>{formattedDate}</strong>
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
    datastoreUrl: state.otp.config.datastoreUrl,
    searches: state.otp.searches,
    visibleRequests: getVisibleRequests(state)
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
