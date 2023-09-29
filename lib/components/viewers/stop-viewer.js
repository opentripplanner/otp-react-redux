/* eslint-disable react/prop-types */
import { Alert, Button } from 'react-bootstrap'
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Calendar } from '@styled-icons/fa-solid/Calendar'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { connect } from 'react-redux'
import { format } from 'date-fns'
import { FormattedMessage, injectIntl } from 'react-intl'
import { InfoCircle } from '@styled-icons/fa-solid/InfoCircle'
import { Search } from '@styled-icons/fa-solid/Search'
import { Star as StarRegular } from '@styled-icons/fa-regular/Star'
import { Star as StarSolid } from '@styled-icons/fa-solid/Star'
import { utcToZonedTime } from 'date-fns-tz'
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
import { Icon, IconWithText, StyledIconWrapper } from '../util/styledIcon'
import { navigateBack } from '../../util/ui'
import { stopIsFlex } from '../../util/viewer'
import OperatorLogo from '../util/operator-logo'
import PageTitle from '../util/page-title'
import ServiceTimeRangeRetriever from '../util/service-time-range-retriever'
import Strong from '../util/strong-text'
import withMap from '../map/with-map'

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
    const { fetchStopInfo, map, viewedStop } = this.props
    // Load the viewed stop in the store when the Stop Viewer first mounts
    fetchStopInfo(map, viewedStop)
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

  getOperator = () => {
    const { stopData, transitOperators } = this.props

    // We can use the first route, as this operator will only be used if there is only one operator
    return transitOperators.find(
      (o) =>
        o.agencyId === (stopData?.agencyId || stopData?.routes?.[0]?.agencyId)
    )
  }

  /**
   * Gets a breadcrumbs-like title with format (operator stopcode/id | mode),
   * so we don't need to internationalize the title bar structure.
   */
  getTitle = () => {
    const { intl, stopData } = this.props
    const { isShowingSchedule } = this.state
    const operator = this.getOperator()
    return [
      (operator ? `${operator.name} ` : '') +
        intl.formatMessage(
          { id: 'components.StopViewer.titleBarStopId' },
          {
            stopId: stopData && coreUtils.itinerary.getDisplayedStopId(stopData)
          }
        ),
      isShowingSchedule
        ? intl.formatMessage({ id: 'components.StopViewer.schedule' })
        : intl.formatMessage({ id: 'components.StopViewer.nextArrivals' })
    ]
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      fetchStopInfo,
      homeTimezone,
      map,
      stopData,
      viewedStop,
      zoomToPlace
    } = this.props
    const { date, isShowingSchedule } = this.state

    if (prevProps.viewedStop?.stopId !== viewedStop?.stopId && map) {
      // Reset state to default if stop changes (i.e., show next arrivals).
      this.setState(getDefaultState(homeTimezone))
      fetchStopInfo(map, viewedStop)
    } else if (map && prevProps.map !== map && stopData) {
      // If only the map instance was updated (and stop data is fetched), then just zoom to the stop.
      zoomToPlace(map, stopData)
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
    const { map, stopData, zoomToPlace } = this.props
    zoomToPlace(map, stopData)
  }

  _renderHeader = (agencyCount) => {
    const {
      enableFavoriteStops,
      hideBackButton,
      intl,
      showUserSettings,
      stopData
    } = this.props

    // We can use the first route, as this operator will only be used if there is only one operator
    const stationOperator = this.getOperator()

    return (
      <div className="stop-viewer-header">
        {/* Back button */}
        {!hideBackButton && (
          <div className="back-button-container">
            <Button bsSize="small" onClick={this._backClicked}>
              <IconWithText Icon={ArrowLeft}>
                <FormattedMessage id="common.forms.back" />
              </IconWithText>
            </Button>
          </div>
        )}

        {/* Header Text */}
        <div className="header-text">
          {stopData ? (
            <h1 style={{ paddingLeft: '0.5ch' }}>
              {agencyCount <= 1 && stationOperator && (
                /* Span with agency classname allows optional contrast/customization in user 
                config for logos with poor contrast. Class name is hyphenated agency name 
                e.g. "sound-transit" */
                <span
                  className={stationOperator.name
                    .replace(/\s+/g, '-')
                    .toLowerCase()}
                >
                  <OperatorLogo
                    alt={intl.formatMessage(
                      {
                        id: 'components.StopViewer.operatorLogoAriaLabel'
                      },
                      {
                        operatorName: stationOperator.name
                      }
                    )}
                    operator={stationOperator}
                  />
                </span>
              )}
              {stopData.name}
            </h1>
          ) : (
            <h1>
              <FormattedMessage id="components.StopViewer.loadingText" />
            </h1>
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
              <StyledIconWrapper>
                {this._isFavorite() ? <StarSolid /> : <StarRegular />}
              </StyledIconWrapper>
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
    const { calendarMax, calendarMin, homeTimezone, intl, stopData } =
      this.props
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
          <IconWithText Icon={InfoCircle}>
            <FormattedMessage
              id="components.StopViewer.timezoneWarning"
              values={{ strong: Strong, timezoneCode }}
            />
          </IconWithText>
        </StyledAlert>
      )
    }

    return (
      <div
        className="stop-viewer-controls"
        role="group"
        style={{ marginBottom: '10px' }}
      >
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
            <Icon Icon={Search} style={{ marginLeft: '0.2em' }} />
          </button>
          {!isFlex && (
            <button
              className="link-button pull-right"
              onClick={this._toggleScheduleView}
              style={{ fontSize: 'small' }}
            >
              <IconWithText Icon={isShowingSchedule ? Clock : Calendar}>
                {isShowingSchedule ? (
                  <FormattedMessage id="components.StopViewer.viewNextArrivals" />
                ) : (
                  <FormattedMessage id="components.StopViewer.viewSchedule" />
                )}
              </IconWithText>
            </button>
          )}
        </div>
        <span role="group">
          <FromToLocationPicker
            label
            onFromClick={this._onClickPlanFrom}
            onToClick={this._onClickPlanTo}
          />
        </span>
        {isShowingSchedule && (
          <input
            aria-label={intl.formatMessage({
              id: 'components.StopViewer.findSchedule'
            })}
            className="pull-right"
            max={calendarMax}
            min={calendarMin}
            onChange={this.handleDateChange}
            onKeyDown={this.props.onKeyDown}
            required
            type="date"
            value={this.state.date}
          />
        )}

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

    let contents
    const hasStopTimesAndRoutes = !!(
      stopData &&
      stopData.stopTimes &&
      stopData.stopTimes.length > 0 &&
      stopData.routes
    )
    const agencyCount = new Set(stopData?.routes?.map((r) => r.agencyId)).size

    if (stopIsFlex(stopData)) {
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
        <>
          {!hasStopTimesAndRoutes && (
            <FormattedMessage id="components.StopViewer.noStopsFound" />
          )}
          <LiveStopTimes
            autoRefreshStopTimes={autoRefreshStopTimes}
            findStopTimesForStop={findStopTimesForStop}
            homeTimezone={homeTimezone}
            nearbyStops={nearbyStops}
            setHoveredStop={setHoveredStop}
            showNearbyStops={showNearbyStops}
            // Only show operator logos if there are multiple operators to differentiate between
            showOperatorLogo={agencyCount > 1}
            stopData={stopData}
            stopViewerArriving={stopViewerArriving}
            stopViewerConfig={stopViewerConfig}
            toggleAutoRefresh={toggleAutoRefresh}
            transitOperators={transitOperators}
            viewedStop={viewedStop}
          />
        </>
      )
    }

    return (
      <div className="stop-viewer base-color-bg">
        <PageTitle title={this.getTitle()} />
        <ServiceTimeRangeRetriever />
        {/* Header Block */}
        {this._renderHeader(agencyCount)}

        {stopData && (
          <div className="stop-viewer-body">
            {this._renderControls()}
            {/* scrollable list of scheduled stops requires tabIndex 
            for keyboard navigation */}
            <Scrollable tabIndex={0}>{contents}</Scrollable>
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
  const { config, serviceTimeRange = {}, transitIndex, ui } = state.otp
  const { homeTimezone, language, persistence, stopViewer, transitOperators } =
    config
  const { autoRefreshStopTimes = true, favoriteStops } = state.user.localUser
  const stopLookup = transitIndex.stops
  const stopData = stopLookup[ui.viewedStop.stopId]
  const nearbyStops = Array.from(new Set(stopData?.nearbyStops))?.map(
    (stopId) => stopLookup[stopId]
  )
  const now = new Date()
  const thisYear = now.getFullYear()
  const { end = 0, start = 0 } = serviceTimeRange
  // If start is not provided, default to the first day of the current calendar year in the user's timezone.
  // (No timezone conversion is needed in this case.)
  // If start is provided in OTP, convert that date in the agency's home time zone.
  const calendarMin = format(
    start
      ? utcToZonedTime(start * 1000, homeTimezone)
      : new Date(thisYear, 0, 1),
    'yyyy-MM-dd'
  )
  // If end is not provided, default to the last day of the next calendar year in the user's timezone.
  // (No timezone conversion is needed in this case.)
  // If end date is provided and falls at midnight agency time,
  // use the previous second to get the last service day available.
  const calendarMax = format(
    end
      ? utcToZonedTime((end - 1) * 1000, homeTimezone)
      : new Date(thisYear + 1, 11, 31),
    'yyyy-MM-dd'
  )

  return {
    autoRefreshStopTimes,
    calendarMax,
    calendarMin,
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
  zoomToPlace: mapActions.zoomToPlace
}

export default injectIntl(
  withMap(connect(mapStateToProps, mapDispatchToProps)(StopViewer))
)
