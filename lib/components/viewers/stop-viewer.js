import moment from 'moment'
import 'moment-timezone'
import coreUtils from '@opentripplanner/core-utils'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Alert, Button, Glyphicon } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import Icon from '../narrative/icon'
import { getShowUserSettings, getStopViewerConfig } from '../../util/state'

import LiveStopTimes from './live-stop-times'
import StopScheduleTable from './stop-schedule-table'

const BoldText = contents => <b>{contents}</b>
const StrongText = contents => <strong>{contents}</strong>

const {
  getUserTimezone,
  OTP_API_DATE_FORMAT
} = coreUtils.time

const defaultState = {
  date: moment().format(OTP_API_DATE_FORMAT),
  scheduleView: false
}

// A scrollable container for the contents of the stop viewer body.
const Scrollable = styled.div`
  margin-right: -12px;
  overflow-y: auto;
  padding-right: 12px;
`
// Alert with custom styles
const StyledAlert = styled(Alert)`
  /* 'clear: both' prevents the date selector from overlapping with the alert. */
  clear: both;
  margin: 10px 0;
  padding: 5px 10px;
  text-align: center;
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
      lat: stopData.lat,
      lon: stopData.lon,
      name: stopData.name
    }
    setLocation({ location, locationType, reverseGeocode: true })
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
    findStopTimesForStop({ date, stopId: viewedStop.stopId })
  }

  _toggleScheduleView = () => {
    const {date, scheduleView: isShowingScheduleView} = this.state

    // If not currently showing schedule view, fetch schedules for current date.
    // Otherwise fetch next arrivals.
    this._findStopTimesForDate(!isShowingScheduleView ? date : null)

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
            ><Icon type='arrow-left' /><FormattedMessage id='common.forms.back' /></Button>
          </div>
        )}

        {/* Header Text */}
        <div className='header-text'>
          {stopData
            ? <span>{stopData.name}</span>
            : <span><FormattedMessage id='components.StopViewer.loadingText' /></span>
          }
          {showUserSettings
            ? <Button
              bsSize='large'
              bsStyle='link'
              onClick={this._toggleFavorite}
              style={{
                color: this._isFavorite() ? 'yellow' : 'black',
                marginLeft: '5px',
                padding: 0
              }}>
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
    const {homeTimezone, stopData} = this.props
    const {scheduleView} = this.state
    const userTimeZone = getUserTimezone()
    const inHomeTimezone = homeTimezone && homeTimezone === userTimeZone

    // Rewrite stop ID to not include Agency prefix, if present
    // TODO: make this functionality configurable?
    let stopId
    if (stopData && stopData.id) {
      stopId = stopData.id.includes(':') ? stopData.id.split(':')[1] : stopData.id
    }

    let timezoneWarning
    if (!inHomeTimezone) {
      const timezoneCode = moment().tz(homeTimezone).format('z')

      // Display a banner about the departure timezone if user's timezone is not the configured 'homeTimezone'
      // (e.g. cases where a user in New York looks at a schedule in Los Angeles).
      timezoneWarning = (
        <StyledAlert bsStyle='info'>
          <Glyphicon glyph='info-sign' />
          <FormattedMessage
            id='components.StopViewer.timezoneWarning'
            values={{strong: StrongText, timezoneCode}}
          />
        </StyledAlert>
      )
    }

    return (
      <div style={{ marginBottom: '10px' }}>
        <div>
          <FormattedMessage
            id='components.StopViewer.displayStopId'
            values={{b: BoldText, stopId}}
          />
          <button
            className='link-button pull-right'
            onClick={this._toggleScheduleView}
            style={{ fontSize: 'small' }}>
            <Icon type={scheduleView ? 'clock-o' : 'calendar'} />{' '}
            <FormattedMessage
              id='components.StopViewer.viewTypeBtnText'
              values={{scheduleView: scheduleView ? 'true' : 'false'}}
            />
          </button>
        </div>
        <b><FormattedMessage id='components.StopViewer.planTrip' /></b>
        <FromToLocationPicker
          onFromClick={this._onClickPlanFrom}
          onToClick={this._onClickPlanTo} />
        {scheduleView && <input
          className='pull-right'
          onChange={this.handleDateChange}
          onKeyDown={this.props.onKeyDown}
          required
          style={{
            border: 'none',
            outline: 'none',
            width: '125px'
          }}
          type='date'
          value={this.state.date}
        />}

        {timezoneWarning}
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
      toggleAutoRefresh,
      transitOperators,
      use24HourFormat,
      viewedStop
    } = this.props
    const timeFormat = use24HourFormat ? 'H:mm' : 'h:mm a'
    const { date, scheduleView } = this.state
    const { showBlockIds } = stopViewerConfig
    const hasStopTimesAndRoutes = !!(stopData && stopData.stopTimes && stopData.stopTimes.length > 0 && stopData.routes)

    let contents
    if (!hasStopTimesAndRoutes) {
      contents = <div><FormattedMessage id='components.StopViewer.noStopsFound' /></div>
    } else if (scheduleView) {
      contents = (
        <StopScheduleTable
          date={date}
          homeTimezone={homeTimezone}
          showBlockIds={showBlockIds}
          stopData={stopData}
          timeFormat={timeFormat}
        />
      )
    } else {
      contents = (
        <LiveStopTimes
          autoRefreshStopTimes={autoRefreshStopTimes}
          findStopTimesForStop={findStopTimesForStop}
          homeTimezone={homeTimezone}
          stopData={stopData}
          stopViewerArriving={stopViewerArriving}
          stopViewerConfig={stopViewerConfig}
          timeFormat={timeFormat}
          toggleAutoRefresh={toggleAutoRefresh}
          transitOperators={transitOperators}
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
  const showUserSettings = getShowUserSettings(state)
  const stopViewerConfig = getStopViewerConfig(state)
  return {
    autoRefreshStopTimes: state.otp.user.autoRefreshStopTimes,
    favoriteStops: state.otp.user.favoriteStops,
    homeTimezone: state.otp.config.homeTimezone,
    showUserSettings,
    stopData: state.otp.transitIndex.stops[state.otp.ui.viewedStop.stopId],
    stopViewerArriving: state.otp.config.language.stopViewerArriving,
    stopViewerConfig,
    transitOperators: state.otp.config.transitOperators,
    use24HourFormat: state.user?.loggedInUser?.use24HourFormat ?? false,
    viewedStop: state.otp.ui.viewedStop
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
