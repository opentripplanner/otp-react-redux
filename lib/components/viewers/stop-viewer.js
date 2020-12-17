import moment from 'moment'
import 'moment-timezone'
import coreUtils from '@opentripplanner/core-utils'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Icon from '../narrative/icon'
import * as uiActions from '../../actions/ui'
import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import StopLiveTable from './stop-live-table'
import StopScheduleTable from './stop-schedule-table'
import { getShowUserSettings, getStopViewerConfig } from '../../util/state'

const {
  getTimeFormat,
  OTP_API_DATE_FORMAT
} = coreUtils.time

const defaultState = {
  date: moment().format(OTP_API_DATE_FORMAT),
  scheduleView: false
}

// A scrollable container for the contents of the stop viewer body.
const Scrollable = styled.div`
  height: 100%;
  overflow-y: auto;
`

class StopViewer extends Component {
  state = defaultState

  static propTypes = {
    hideBackButton: PropTypes.bool,
    stopData: PropTypes.object,
    viewedStop: PropTypes.object
  }

  _backClicked = () => this.props.setMainPanelContent(null)

  _setLocationFromStop = (locationType) => {
    const { setLocation, stopData } = this.props
    const location = {
      name: stopData.name,
      lat: stopData.lat,
      lon: stopData.lon
    }
    setLocation({ locationType, location, reverseGeocode: true })
    this.setState({ popupPosition: null })
  }

  _onClickPlanTo = () => this._setLocationFromStop('to')

  _onClickPlanFrom = () => this._setLocationFromStop('from')

  componentDidMount () {
    // Load the viewed stop in the store when the Stop Viewer first mounts
    this.props.findStop({ stopId: this.props.viewedStop.stopId })
  }

  _toggleFavorite = () => {
    const { forgetStop, rememberStop, stopData } = this.props
    if (this._isFavorite()) forgetStop(stopData.id)
    else rememberStop(stopData)
  }

  _findStopTimesForDate = date => {
    const { findStopTimesForStop, viewedStop } = this.props

    findStopTimesForStop({
      date,
      stopId: viewedStop.stopId
    })
  }

  _toggleScheduleView = () => {
    const {date, scheduleView: isShowingScheduleView} = this.state
    if (!isShowingScheduleView) {
      // If not currently showing schedule view, fetch schedules for current date.
      this._findStopTimesForDate(date)
    }
    this.setState({scheduleView: !isShowingScheduleView})
  }

  _isFavorite = () => this.props.stopData &&
    this.props.favoriteStops.findIndex(s => s.id === this.props.stopData.id) !== -1

  componentDidUpdate (prevProps) {
    if (
      prevProps.viewedStop &&
      this.props.viewedStop &&
      prevProps.viewedStop.stopId !== this.props.viewedStop.stopId
    ) {
      // Reset state to default if stop changes (i.e., show next arrivals).
      this.setState(defaultState)
      this.props.findStop({ stopId: this.props.viewedStop.stopId })
    }
  }

  handleDateChange = evt => {
    const date = evt.target.value
    this._findStopTimesForDate(date)
    this.setState({ date })
  }

  _renderHeader = () => {
    const {hideBackButton, showUserSettings, stopData} = this.props
    return (
      <div className='stop-viewer-header'>
        {/* Back button */}
        {!hideBackButton && (
          <div className='back-button-container'>
            <Button
              bsSize='small'
              onClick={this._backClicked}
            ><Icon type='arrow-left' />Back</Button>
          </div>
        )}

        {/* Header Text */}
        <div className='header-text'>
          {stopData
            ? <span>{stopData.name}</span>
            : <span>Loading Stop...</span>
          }
          {showUserSettings
            ? <Button
              onClick={this._toggleFavorite}
              bsSize='large'
              style={{
                color: this._isFavorite() ? 'yellow' : 'black',
                padding: 0,
                marginLeft: '5px'
              }}
              bsStyle='link'>
              <Icon type={this._isFavorite() ? 'star' : 'star-o'} />
            </Button>
            : null
          }
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    )
  }

  /**
   * Plan trip from/to here buttons, plus the schedule/next arrivals toggle.
   * TODO: Can this use SetFromToButtons?
   */
  _renderControls = () => {
    const {stopData} = this.props
    const {scheduleView} = this.state
    // Rewrite stop ID to not include Agency prefix, if present
    // TODO: make this functionality configurable?
    let stopId
    if (stopData && stopData.id) {
      stopId = stopData.id.includes(':') ? stopData.id.split(':')[1] : stopData.id
    }
    return (
      <div style={{ marginBottom: '10px' }}>
        <div>
          <b>Stop ID</b>: {stopId}
          <button
            className='link-button pull-right'
            style={{ fontSize: 'small' }}
            onClick={this._toggleScheduleView}>
            <Icon type={scheduleView ? 'clock-o' : 'calendar'} />{' '}
            View {scheduleView ? 'next arrivals' : 'schedule'}
          </button>
        </div>
        <b>Plan a trip:</b>
        <FromToLocationPicker
          onFromClick={this._onClickPlanFrom}
          onToClick={this._onClickPlanTo} />
        {scheduleView && <input
          className='pull-right'
          onKeyDown={this.props.onKeyDown}
          type='date'
          value={this.state.date}
          style={{
            width: '125px',
            border: 'none',
            outline: 'none'
          }}
          required
          onChange={this.handleDateChange}
        />}
      </div>
    )
  }

  render () {
    const {
      autoRefreshStopTimes,
      findStopTimesForStop,
      homeTimezone,
      stopData,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat,
      toggleAutoRefresh,
      transitOperators,
      viewedStop
    } = this.props
    const { scheduleView } = this.state
    const hasStopTimesAndRoutes = !!(stopData && stopData.stopTimes && stopData.stopTimes.length > 0 && stopData.routes)

    let contents
    if (!hasStopTimesAndRoutes) {
      contents = <div>No stop times found for date.</div>
    } else if (scheduleView) {
      contents = (
        <StopScheduleTable
          homeTimezone={homeTimezone}
          stopData={stopData}
          timeFormat={timeFormat}
        />
      )
    } else {
      contents = (
        <StopLiveTable
          autoRefreshStopTimes={autoRefreshStopTimes}
          findStopTimesForStop={findStopTimesForStop}
          homeTimezone={homeTimezone}
          stopData={stopData}
          stopViewerArriving={stopViewerArriving}
          stopViewerConfig={stopViewerConfig}
          timeFormat={timeFormat}
          transitOperators={transitOperators}
          toggleAutoRefresh={toggleAutoRefresh}
          viewedStop={viewedStop}
        />
      )
    }

    return (
      <div className='stop-viewer'>
        {/* Header Block */}
        {this._renderHeader()}

        {stopData && (
          <div className='stop-viewer-body'>
            {this._renderControls()}
            <Scrollable>
              {contents}
            </Scrollable>
            {/* Future: add stop details */}
          </div>
        )}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state.otp)
  const stopViewerConfig = getStopViewerConfig(state.otp)
  return {
    autoRefreshStopTimes: state.otp.user.autoRefreshStopTimes,
    favoriteStops: state.otp.user.favoriteStops,
    homeTimezone: state.otp.config.homeTimezone,
    viewedStop: state.otp.ui.viewedStop,
    showUserSettings,
    stopData: state.otp.transitIndex.stops[state.otp.ui.viewedStop.stopId],
    stopViewerArriving: state.otp.config.language.stopViewerArriving,
    stopViewerConfig,
    timeFormat: getTimeFormat(state.otp.config),
    transitOperators: state.otp.config.transitOperators
  }
}

const mapDispatchToProps = {
  findStop: apiActions.findStop,
  findStopTimesForStop: apiActions.findStopTimesForStop,
  forgetStop: mapActions.forgetStop,
  rememberStop: mapActions.rememberStop,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  toggleAutoRefresh: uiActions.toggleAutoRefresh
}

export default connect(mapStateToProps, mapDispatchToProps)(StopViewer)
