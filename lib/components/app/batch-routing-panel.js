import moment from 'moment'
import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import LocationField from '../form/connected-location-field'
import UserSettings from '../form/user-settings'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { hasValidLocation, getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

const departureOptions = [
  {
    // Default option.
    value: 'NOW',
    children: 'Now'
  },
  {
    value: 'DEPART',
    children: 'Depart at'
  },
  {
    value: 'ARRIVE',
    children: 'Arrive by'
  }
]

const TIME_FORMATS = [
  'HH:mm:ss',
  'h:mm:ss a',
  'h:mm:ssa',
  'h:mm a',
  'h:mma',
  'h:mm',
  'HHmm',
  'hmm',
  'ha',
  'h',
  'HH:mm'
].map(format => `YYYY-MM-DDT${format}`)

class DateTimeOptions extends Component {
  _setDepartArrive = evt => {
    const {value: departArrive} = evt.target
    if (departArrive === 'NOW') {
      this.props.setQueryParam({
        departArrive,
        date: moment().format(OTP_API_DATE_FORMAT),
        time: moment().format(OTP_API_TIME_FORMAT)
      })
    } else {
      this.props.setQueryParam({ departArrive })
    }
  }

  handleDateChange = evt => {
    this.props.setQueryParam({ date: evt.target.value })
  }

  handleTimeChange = evt => {
    const timeInput = evt.target.value
    console.log(timeInput)
    const date = moment().startOf('day').format('YYYY-MM-DD')
    const time = moment(date + 'T' + timeInput, TIME_FORMATS)
    this.props.setQueryParam({ time: time.format(OTP_API_TIME_FORMAT) })
  }

  render () {
    const {date, departArrive, time} = this.props
    const leaveNow = departArrive === 'NOW' && !date && !time
    const dateTime = moment(`${date} ${time}`)
    const cleanDate = dateTime.format('YYYY-MM-DD')
    const cleanTime = dateTime.format('HH:mm')
    return (
      <>
        <select
          onBlur={this._setDepartArrive}
          onKeyDown={this.props.onKeyDown}
          value={departArrive}
          onChange={this._setDepartArrive}>
          {departureOptions.map(o => (
            <option key={o.value} {...o} />
          ))}
        </select>
        {leaveNow
          ? null
          : <span style={{
            display: 'inline-flex'
          }}>
            <span>{cleanTime}</span>
            <input
              style={{width: '50px'}}
              onKeyDown={this.props.onKeyDown}
              required
              onChange={this.handleTimeChange}
            />
          </span>
        }
        {leaveNow
          ? null
          : <input
            onKeyDown={this.props.onKeyDown}
            type='date'
            value={cleanDate}
            style={{
              position: 'absolute',
              left: '180px',
              width: '124px',
              border: 'none',
              outline: 'none'
            }}
            required
            onChange={this.handleDateChange}
          />
        }
      </>
    )
  }
}

/**
 * Main panel for the batch/trip comparison form.
 * @extends Component
 */
class BatchRoutingPanel extends Component {
  _planTrip = () => {
    const {currentQuery, routingQuery} = this.props
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) issues.push('from')
    if (!hasValidLocation(currentQuery, 'to')) issues.push('to')
    if (issues.length > 0) {
      // TODO: replace with less obtrusive validation.
      window.alert(`Please define the following fields to plan a trip: ${issues.join(', ')}`)
      return
    }
    routingQuery()
  }

  render () {
    const {
      activeSearch,
      currentQuery,
      mobile,
      setQueryParam,
      showUserSettings
    } = this.props
    const {
      departArrive,
      date,
      time
    } = currentQuery
    const actionText = mobile ? 'tap' : 'click'
    return (
      <ViewerContainer>
        <LocationField
          inputPlaceholder={`Enter start location or ${actionText} on map...`}
          locationType='from'
          showClearButton
        />
        <LocationField
          inputPlaceholder={`Enter destination or ${actionText} on map...`}
          locationType='to'
          showClearButton={!mobile}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center'
        }} className='comparison-form'>
          <DateTimeOptions
            date={date}
            onKeyDown={this._handleFormKeyDown}
            departArrive={departArrive}
            setQueryParam={setQueryParam}
            time={time} />
          <button
            style={{
              height: '50px',
              width: '50px',
              margin: '0px',
              marginRight: '5px'
            }}
          >
            <Icon type='cog' className='fa-2x' />
          </button>
          <button
            style={{
              height: '50px',
              width: '100px',
              margin: '0px',
              fontSize: 'small',
              textAlign: 'left'
            }}
          >
            <Icon type='calendar' /> Today<br />
            <Icon type='clock-o' /> Now<br />
          </button>
          <Button
            bsStyle='default'
            bsSize='small'
            onClick={this._planTrip}
            style={{
              height: '50px',
              width: '50px',
              margin: '0px',
              marginLeft: 'auto',
              backgroundColor: '#F5F5A7'
            }} >
            <Icon type='search' className='fa-2x' />
          </Button>
        </div>
        {!activeSearch && showUserSettings &&
          <UserSettings />
        }
        <div className='desktop-narrative-container'>
          <NarrativeItineraries
            containerStyle={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: '218px', // This is variable dependent on height of the form above.
              right: '0',
              left: '0',
              bottom: '0'
            }}
          />
        </div>
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    activeSearch: getActiveSearch(state.otp),
    currentQuery: state.otp.currentQuery,
    expandAdvanced: state.otp.user.expandAdvanced,
    showUserSettings
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchRoutingPanel)
