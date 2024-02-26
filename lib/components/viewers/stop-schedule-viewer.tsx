import { Alert, Button } from 'react-bootstrap'
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { connect } from 'react-redux'
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle'
import { format, parse } from 'date-fns'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { MagnifyingGlass } from '@styled-icons/fa-solid/MagnifyingGlass'
import { MapRef } from 'react-map-gl'
import { Search } from '@styled-icons/fa-solid/Search'
import { utcToZonedTime } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Component, FormEvent } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import { AppReduxState } from '../../util/state-types'
import { Icon, IconWithText } from '../util/styledIcon'
import { isBlank, navigateBack } from '../../util/ui'
import { SetLocationHandler, StopData } from '../util/types'
import { TransitOperatorConfig } from '../../util/config-types'
import Link from '../../util/link'
import OperatorLogo from '../util/operator-logo'
import PageTitle from '../util/page-title'
import ServiceTimeRangeRetriever from '../util/service-time-range-retriever'
import Strong from '../util/strong-text'
import withMap from '../map/with-map'

import FavoriteStopToggle from './favorite-stop-toggle'
import StopScheduleTable from './stop-schedule-table'
import TimezoneWarning from './timezone-warning'

interface Props {
  calendarMax: string
  calendarMin: string
  findStopTimesForStop: (arg: { date: string; stopId: string }) => void
  hideBackButton?: boolean
  homeTimezone: string
  intl: IntlShape
  map?: MapRef
  setLocation: SetLocationHandler
  showBlockIds?: boolean
  stopData?: StopData
  stopId?: string
  transitOperators: TransitOperatorConfig[]
  // TODO refactor
  zoomToPlace: (
    map?: MapRef,
    place?: { lat: number; lon: number },
    zoom?: number
  ) => void
}

interface State {
  date: string
  scheduleFetched: boolean
}

const { getCurrentDate, getUserTimezone } = coreUtils.time

/** The native date format used with <input type="date" /> elements */
const inputDateFormat = 'yyyy-MM-dd'

function getDefaultState(timeZone: string) {
  return {
    // Compare dates/times in the stop viewer based on the agency's timezone.
    date: getCurrentDate(timeZone),
    scheduleFetched: false
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

class StopScheduleViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = getDefaultState(props.homeTimezone)
  }

  _backClicked = () => navigateBack()

  _setLocationFromStop = (locationType: string) => {
    const { setLocation, stopData } = this.props
    if (stopData) {
      const location = {
        lat: stopData.lat,
        lon: stopData.lon,
        name: stopData.name
      }
      setLocation({ location, locationType, reverseGeocode: false })
    }
  }

  _onClickPlanTo = () => this._setLocationFromStop('to')

  _onClickPlanFrom = () => this._setLocationFromStop('from')

  componentDidMount() {
    this._findStopTimesForDate(this.state.date)
  }

  _findStopTimesForDate = (date: string) => {
    const { findStopTimesForStop, stopId } = this.props
    if (stopId) {
      findStopTimesForStop({ date, stopId })
      this.setState({ scheduleFetched: true })
    }
  }

  getOperator = () => {
    const { stopData, transitOperators } = this.props

    // We can use the first route, as this operator will only be used if there is only one operator
    return transitOperators.find(
      (o) => o.agencyId === stopData?.routes?.[0]?.agency.gtfsId
    )
  }

  /**
   * Gets a breadcrumbs-like title with format (operator stopcode/id | mode),
   * so we don't need to internationalize the title bar structure.
   */
  getTitle = () => {
    const { intl, stopData } = this.props
    const operator = this.getOperator()
    return [
      (operator ? `${operator.name} ` : '') +
        intl.formatMessage(
          { id: 'components.StopViewer.titleBarStopId' },
          {
            stopId: stopData && coreUtils.itinerary.getDisplayedStopId(stopData)
          }
        ),
      // TODO: Rename string ids
      intl.formatMessage({ id: 'components.StopViewer.schedule' })
    ]
  }

  componentDidUpdate() {
    /*
    const { date, scheduleFetched } = this.state
    if (
      !scheduleFetched &&
      // This will hammer OTP if a stop genuinely has fewer than 4
      // departures a day
      this.props.stopData?.stopTimes?.[0]?.times?.length <= 3
    ) {
      // If the viewing mode has changed to schedule view,
      // then fetch all departures for the current day
      // (otherwise only a few are shown).
      this._findStopTimesForDate(date)
    }
    */
  }

  _isDateWithinRange = (date: string) => {
    const { calendarMax, calendarMin } = this.props
    // Date comparison is string-based (lexicographic).
    return !isBlank(date) && date >= calendarMin && date <= calendarMax
  }

  handleDateChange = (evt: FormEvent<HTMLInputElement>) => {
    // Check for non-empty date, and that date is within range before making request.
    // (Users can enter a date outside of the range using the Up/Down arrow keys in Firefox and Safari.)
    const date = (evt.target as HTMLInputElement).value
    if (this._isDateWithinRange(date)) {
      this._findStopTimesForDate(date)
    }
    this.setState({ date, scheduleFetched: false })
  }

  _zoomToStop = () => {
    const { map, stopData, zoomToPlace } = this.props
    zoomToPlace(map, stopData)
  }

  _renderHeader = (agencyCount: number) => {
    const { hideBackButton, intl, stopData } = this.props

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
                  className={
                    stationOperator?.name
                      ? stationOperator.name.replace(/\s+/g, '-').toLowerCase()
                      : ''
                  }
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
              --
              {stopData.name}
            </h1>
          ) : (
            <h1>
              <FormattedMessage id="components.StopViewer.loadingText" />
            </h1>
          )}
          <FavoriteStopToggle stopData={stopData} />
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    )
  }

  /**
   * Plan trip from/to here buttons, plus the schedule/next arrivals toggle.
   */
  _renderControls = () => {
    const { calendarMax, calendarMin, homeTimezone, intl, stopData, stopId } =
      this.props
    const { date } = this.state
    const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()

    const displayedStopId = stopData
      ? coreUtils.itinerary.getDisplayedStopId(stopData)
      : ''

    let warning
    if (!inHomeTimezone && this._isDateWithinRange(date)) {
      // Display a banner about the departure timezone if user's timezone is not the configured 'homeTimezone'
      // (e.g. cases where a user in New York looks at a schedule in Los Angeles).
      warning = (
        <StyledAlert bsStyle="info">
          <TimezoneWarning
            date={parse(date, inputDateFormat, new Date())}
            homeTimezone={homeTimezone}
          />
        </StyledAlert>
      )
    }

    if (!this._isDateWithinRange(date)) {
      warning = (
        <StyledAlert bsStyle="warning">
          <IconWithText Icon={ExclamationCircle}>
            <FormattedMessage id="components.StopViewer.noStopsFound" />
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
            values={{ stopId: displayedStopId, strong: Strong }}
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
          {stopData ? (
            <Link
              className="pull-right"
              style={{ color: 'inherit', fontSize: 'small' }}
              to={`/nearby/${stopData.lat},${stopData.lon}`}
              toParams={{ entityId: stopId }}
            >
              {/* FIXME: What icon should we use? */}
              <IconWithText Icon={MagnifyingGlass}>
                <FormattedMessage id="components.StopViewer.viewNearby" />
              </IconWithText>
            </Link>
          ) : null}
        </div>
        <span role="group">
          <FromToLocationPicker
            label
            onFromClick={this._onClickPlanFrom}
            onToClick={this._onClickPlanTo}
          />
        </span>
        <input
          aria-label={intl.formatMessage({
            id: 'components.StopViewer.findSchedule'
          })}
          className="pull-right"
          max={calendarMax}
          min={calendarMin}
          onChange={this.handleDateChange}
          required
          type="date"
          value={this.state.date}
        />

        {warning}
      </div>
    )
  }

  render() {
    const { homeTimezone, showBlockIds, stopData } = this.props
    const { date } = this.state
    const agencyCount = new Set(stopData?.routes?.map((r) => r.agency.gtfsId))
      .size

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
            <Scrollable tabIndex={0}>
              {this._isDateWithinRange(date) && (
                <StopScheduleTable
                  date={date}
                  homeTimezone={homeTimezone}
                  showBlockIds={showBlockIds}
                  stopData={stopData}
                />
              )}
            </Scrollable>
          </div>
        )}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state: AppReduxState) => {
  const {
    config,
    serviceTimeRange = { end: 0, start: 0 },
    transitIndex,
    ui
  } = state.otp
  const {
    homeTimezone,
    stopViewer: stopViewerConfig,
    transitOperators = [] as TransitOperatorConfig[]
  } = config
  const stopLookup = transitIndex.stops
  const stopId = ui.viewedStop.stopId
  const stopData = stopLookup[stopId]
  const now = new Date()
  const thisYear = now.getFullYear()
  const { end, start } = serviceTimeRange
  // If start is not provided, default to the first day of the current calendar year in the user's timezone.
  // (No timezone conversion is needed in this case.)
  // If start is provided in OTP, convert that date in the agency's home time zone.
  const calendarMin = format(
    start
      ? utcToZonedTime(start * 1000, homeTimezone)
      : new Date(thisYear, 0, 1),
    inputDateFormat
  )
  // If end is not provided, default to the last day of the next calendar year in the user's timezone.
  // (No timezone conversion is needed in this case.)
  // If end date is provided and falls at midnight agency time,
  // use the previous second to get the last service day available.
  const calendarMax = format(
    end
      ? utcToZonedTime((end - 1) * 1000, homeTimezone)
      : new Date(thisYear + 1, 11, 31),
    inputDateFormat
  )

  return {
    calendarMax,
    calendarMin,
    homeTimezone,
    showBlockIds: stopViewerConfig?.showBlockIds,
    stopData,
    stopId,
    transitOperators
  }
}

const mapDispatchToProps = {
  findStopTimesForStop: apiActions.findStopTimesForStop,
  setLocation: mapActions.setLocation,
  zoomToPlace: mapActions.zoomToPlace
}

export default injectIntl(
  withMap(connect(mapStateToProps, mapDispatchToProps)(StopScheduleViewer))
)
