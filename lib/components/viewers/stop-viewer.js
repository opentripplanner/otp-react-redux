/* eslint-disable react/prop-types */
import { Alert, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { format } from 'date-fns-tz'
import { FormattedMessage, injectIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import dateFnsUSLocale from 'date-fns/locale/en-US'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { getPersistenceMode } from '../../util/user'
import { getShowUserSettings, getStopViewerConfig } from '../../util/state'
import { navigateBack } from '../../util/ui'
import { stopIsFlex } from '../../util/viewer'
import Icon from '../util/icon'
import Strong from '../util/strong-text'

import LiveStopTimes from './live-stop-times'
import StopScheduleTable from './stop-schedule-table'

const { getCurrentDate, getUserTimezone } = coreUtils.time

function getDefaultState(timeZone) {
  return {
    // Compare dates/times in the stop viewer based on the agency's timezone.
    date: getCurrentDate(timeZone),
    isShowingSchedule: false
  }
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
  constructor(props) {
    super(props)
    this.state = getDefaultState(props.homeTimezone)
  }

  static propTypes = {
    hideBackButton: PropTypes.bool,
    stopData: PropTypes.object,
    viewedStop: PropTypes.object
  }

  _backClicked = () => navigateBack()

  _setLocationFromStop = (locationType) => {
    const { setLocation, stopData } = this.props
    const location = {
      lat: stopData.lat,
      lon: stopData.lon,
      name: stopData.name
    }
    setLocation({ location, locationType, reverseGeocode: false })
    this.setState({ popupPosition: null })
  }

  _onClickPlanTo = () => this._setLocationFromStop('to')

  _onClickPlanFrom = () => this._setLocationFromStop('from')

  componentDidMount() {
    // Load the viewed stop in the store when the Stop Viewer first mounts
    this.props.fetchStopInfo(this.props.viewedStop)
  }

  _toggleFavorite = () => {
    const { forgetStop, rememberStop, stopData } = this.props
    if (this._isFavorite()) forgetStop(stopData)
    else rememberStop(stopData)
  }

  _findStopTimesForDate = (date) => {
    const { findStopTimesForStop, viewedStop } = this.props
    findStopTimesForStop({ date, stopId: viewedStop.stopId })
  }

  _toggleScheduleView = () => {
    const { date, isShowingSchedule } = this.state

    // If not currently showing schedule view, fetch schedules for current date.
    // Otherwise fetch next arrivals.
    if (isShowingSchedule) this._findStopTimesForDate(date)

    this.setState({ isShowingSchedule: !isShowingSchedule })
  }

  _isFavorite = () =>
    this.props.stopData &&
    this.props.favoriteStops.findIndex(
      (s) => s.id === this.props.stopData.id
    ) !== -1

  componentDidUpdate(prevProps, prevState) {
    const { fetchStopInfo, homeTimezone, viewedStop } = this.props
    const { date, isShowingSchedule } = this.state

    if (prevProps.viewedStop?.stopId !== viewedStop?.stopId) {
      // Reset state to default if stop changes (i.e., show next arrivals).
      this.setState(getDefaultState(homeTimezone))
      fetchStopInfo(viewedStop)
    } else if (!!isShowingSchedule && !prevState.isShowingSchedule) {
      // If the viewing mode has changed to schedule view,
      // then fetch all departures for the current day
      // (otherwise only a few are shown).
      this._findStopTimesForDate(date)
    }
  }

  handleDateChange = (evt) => {
    const date = evt.target.value
    this._findStopTimesForDate(date)
    this.setState({ date })
  }

  _zoomToStop = () => {
    this.props.zoomToStop(this.props.stopData)
  }

  _renderHeader = () => {
    const { enableFavoriteStops, hideBackButton, showUserSettings, stopData } =
      this.props
    return (
      <div className="stop-viewer-header base-color-bg">
        {/* Back button */}
        {!hideBackButton && (
          <div className="back-button-container">
            <Button bsSize="small" onClick={this._backClicked}>
              <Icon type="arrow-left" />
              <FormattedMessage id="common.forms.back" />
            </Button>
          </div>
        )}

        {/* Header Text */}
        <div className="header-text">
          {stopData ? (
            <span>{stopData.name}</span>
          ) : (
            <span>
              <FormattedMessage id="components.StopViewer.loadingText" />
            </span>
          )}
          {showUserSettings && enableFavoriteStops ? (
            <Button
              bsSize="large"
              bsStyle="link"
              onClick={this._toggleFavorite}
              style={{
                color: this._isFavorite() ? 'yellow' : 'black',
                marginLeft: '5px',
                padding: 0
              }}
            >
              <Icon type={this._isFavorite() ? 'star' : 'star-o'} />
            </Button>
          ) : null}
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
    const { homeTimezone, intl, stopData } = this.props
    const { isShowingSchedule } = this.state
    const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()

    // Rewrite stop ID to not include Agency prefix, if present
    // TODO: make this functionality configurable?
    let stopId
    if (stopData && stopData.id) {
      stopId = stopData.id.includes(':')
        ? stopData.id.split(':')[1]
        : stopData.id
    }

    const isFlex = stopIsFlex(stopData)

    let timezoneWarning
    if (!inHomeTimezone) {
      const timezoneCode = format(Date.now(), 'z', {
        // To avoid ambiguities for now, use the English-US timezone abbreviations ("EST", "PDT", etc.)
        locale: dateFnsUSLocale,
        timeZone: homeTimezone
      })

      // Display a banner about the departure timezone if user's timezone is not the configured 'homeTimezone'
      // (e.g. cases where a user in New York looks at a schedule in Los Angeles).
      timezoneWarning = (
        <StyledAlert bsStyle="info">
          <Icon type="info-circle" withSpace />
          <FormattedMessage
            id="components.StopViewer.timezoneWarning"
            values={{ strong: Strong, timezoneCode }}
          />
        </StyledAlert>
      )
    }

    return (
      <div className="stop-viewer-controls" style={{ marginBottom: '10px' }}>
        <div>
          <FormattedMessage
            id="components.StopViewer.displayStopId"
            values={{ stopId: stopData.code || stopId, strong: Strong }}
          />
          <button
            className="link-button"
            onClick={this._zoomToStop}
            title={intl.formatMessage({
              id: 'components.StopViewer.zoomToStop'
            })}
          >
            <Icon type="search" />
          </button>
          {!isFlex && (
            <button
              className="link-button pull-right"
              onClick={this._toggleScheduleView}
              style={{ fontSize: 'small' }}
            >
              <Icon
                type={isShowingSchedule ? 'clock-o' : 'calendar'}
                withSpace
              />
              {isShowingSchedule ? (
                <FormattedMessage id="components.StopViewer.viewNextArrivals" />
              ) : (
                <FormattedMessage id="components.StopViewer.viewSchedule" />
              )}
            </button>
          )}
          {isShowingSchedule && (
            <input
              className="pull-right"
              onChange={this.handleDateChange}
              onKeyDown={this.props.onKeyDown}
              required
              type="date"
              value={this.state.date}
            />
          )}
        </div>
        <FromToLocationPicker
          label
          onFromClick={this._onClickPlanFrom}
          onToClick={this._onClickPlanTo}
        />

        {timezoneWarning}
      </div>
    )
  }

  render() {
    const {
      autoRefreshStopTimes,
      findStopTimesForStop,
      homeTimezone,
      nearbyStops,
      setHoveredStop,
      showNearbyStops,
      stopData,
      stopViewerArriving,
      stopViewerConfig,
      toggleAutoRefresh,
      transitOperators,
      viewedStop
    } = this.props
    const { date, isShowingSchedule } = this.state
    const { showBlockIds } = stopViewerConfig
    const hasStopTimesAndRoutes = !!(
      stopData &&
      stopData.stopTimes &&
      stopData.stopTimes.length > 0 &&
      stopData.routes
    )
    let contents
    if (!hasStopTimesAndRoutes) {
      contents = (
        <div>
          <FormattedMessage id="components.StopViewer.noStopsFound" />
        </div>
      )
      /* If geometries are available (and are not a point) and stop times 
         are not, it is a strong indication that the stop is a flex stop.

         The extra checks stopData are needed to ensure that the message is 
         not shown while stopData is loading
         */
      if (stopIsFlex(stopData)) {
        contents = (
          <div style={{ lineHeight: 'normal' }}>
            <FormattedMessage id="components.StopViewer.flexStop" />
          </div>
        )
      }
    } else if (isShowingSchedule) {
      contents = (
        <StopScheduleTable
          date={date}
          homeTimezone={homeTimezone}
          showBlockIds={showBlockIds}
          stopData={stopData}
        />
      )
    } else {
      contents = (
        <LiveStopTimes
          autoRefreshStopTimes={autoRefreshStopTimes}
          findStopTimesForStop={findStopTimesForStop}
          homeTimezone={homeTimezone}
          nearbyStops={nearbyStops}
          setHoveredStop={setHoveredStop}
          showNearbyStops={showNearbyStops}
          stopData={stopData}
          stopViewerArriving={stopViewerArriving}
          stopViewerConfig={stopViewerConfig}
          toggleAutoRefresh={toggleAutoRefresh}
          transitOperators={transitOperators}
          viewedStop={viewedStop}
        />
      )
    }

    return (
      <div className="stop-viewer base-color-bg">
        {/* Header Block */}
        {this._renderHeader()}

        {stopData && (
          <div className="stop-viewer-body base-color-bg">
            {this._renderControls()}
            <Scrollable>{contents}</Scrollable>
            {/* Future: add stop details */}
          </div>
        )}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state) => {
  const showUserSettings = getShowUserSettings(state)
  const stopViewerConfig = getStopViewerConfig(state)
  const { config, transitIndex, ui } = state.otp
  const { homeTimezone, language, persistence, stopViewer, transitOperators } =
    config
  const { autoRefreshStopTimes, favoriteStops } = state.user.localUser
  const stopLookup = transitIndex.stops
  const stopData = stopLookup[ui.viewedStop.stopId]
  const nearbyStops = stopData?.nearbyStops?.map((stopId) => stopLookup[stopId])
  return {
    autoRefreshStopTimes,
    enableFavoriteStops: getPersistenceMode(persistence).isLocalStorage,
    favoriteStops,
    homeTimezone,
    nearbyStops,
    showNearbyStops: stopViewer.nearbyRadius > 0,
    showUserSettings,
    stopData,
    stopViewerArriving: language.stopViewerArriving,
    stopViewerConfig,
    transitOperators,
    viewedStop: ui.viewedStop
  }
}

const mapDispatchToProps = {
  fetchStopInfo: apiActions.fetchStopInfo,
  findStopTimesForStop: apiActions.findStopTimesForStop,
  forgetStop: userActions.forgetStop,
  rememberStop: userActions.rememberStop,
  setHoveredStop: uiActions.setHoveredStop,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  toggleAutoRefresh: uiActions.toggleAutoRefresh,
  zoomToStop: mapActions.zoomToStop
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(StopViewer))
