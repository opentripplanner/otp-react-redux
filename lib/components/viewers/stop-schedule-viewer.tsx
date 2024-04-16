import { Alert, Button } from 'react-bootstrap'
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { connect } from 'react-redux'
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle'
import { format, parse } from 'date-fns'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { MagnifyingGlass } from '@styled-icons/fa-solid/MagnifyingGlass'
import { MapRef } from 'react-map-gl'
import { utcToZonedTime } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, FormEvent } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import { AppReduxState } from '../../util/state-types'
import { IconWithText } from '../util/styledIcon'
import { isBlank, navigateBack } from '../../util/ui'
import { StopData, ZoomToPlaceHandler } from '../util/types'
import { stopIsFlex } from '../../util/viewer'
import { TransitOperatorConfig } from '../../util/config-types'
import PageTitle from '../util/page-title'
import ServiceTimeRangeRetriever from '../util/service-time-range-retriever'
import withMap from '../map/with-map'

import { CardBody, CardHeader } from './nearby/styled'
import FavoriteStopToggle from './favorite-stop-toggle'
import FromToPicker from './nearby/from-to-picker'
import StopCardHeader from './nearby/stop-card-header'
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
  showBlockIds?: boolean
  stopData?: StopData
  stopId?: string
  transitOperators: TransitOperatorConfig[]
  zoomToPlace: ZoomToPlaceHandler
}

interface State {
  date: string
}

const { getCurrentDate, getUserTimezone } = coreUtils.time

/** The native date format used with <input type="date" /> elements */
const inputDateFormat = 'yyyy-MM-dd'

function getDefaultState(timeZone: string) {
  return {
    // Compare dates/times in the stop viewer based on the agency's timezone.
    date: getCurrentDate(timeZone)
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

const HeaderCard = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0 0;

  ${CardBody} {
    margin: 25px 0 0;
  }

  input[type='date'] {
    background: inherit;
    border: none;
    clear: right;
    cursor: pointer;
    outline: none;
    width: 125px;
  }
  /* Remove arrows on date input */
  input[type='date']::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  /* For Chromium browsers, remove extra space between date and the calendar icon. */
  input[type='date']::-webkit-calendar-picker-indicator {
    margin: 0;
  }
`

const StyledFromToPicker = styled(FromToPicker)`
  button {
    color: inherit;
  }
  span {
    border-color: currentColor;
  }
  svg {
    color: inherit;
    fill: inherit;
  }
`

class StopScheduleViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = getDefaultState(props.homeTimezone)
  }

  _backClicked = () => navigateBack()

  componentDidMount() {
    this._findStopTimesForDate(this.state.date)
  }

  componentDidUpdate() {
    // FIXME: This is to prevent zooming the map back to entire itinerary
    // when accessing the schedule viewer from the nearby view.
    this._zoomToStop()
  }

  _findStopTimesForDate = (date: string) => {
    const { findStopTimesForStop, stopId } = this.props
    if (stopId) {
      findStopTimesForStop({ date, stopId })
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
    this.setState({ date })
  }

  _zoomToStop = () => {
    const { map, stopData, zoomToPlace } = this.props
    zoomToPlace(map, stopData)
  }

  _renderHeader = (agencyCount: number) => {
    const { hideBackButton, stopData, stopId } = this.props
    return (
      // CSS class stop-viewer-header is needed for customizing how logos are displayed.
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

        <HeaderCard>
          {stopData?.name ? (
            <StopCardHeader
              // FIXME: What icon should we use?
              actionIcon={MagnifyingGlass}
              actionParams={{ entityId: stopId }}
              actionPath={`/nearby/${stopData.lat},${stopData.lon}`}
              actionText={
                <FormattedMessage id="components.StopViewer.viewNearby" />
              }
              fromToSlot={this._renderControls()}
              onZoomClick={this._zoomToStop}
              stopData={stopData}
              titleAs="h1"
            />
          ) : (
            <CardHeader>
              <h1>
                <FormattedMessage id="components.StopViewer.loadingText" />
              </h1>
            </CardHeader>
          )}
        </HeaderCard>
        <FavoriteStopToggle stopData={stopData} />

        <div style={{ clear: 'both' }} />
      </div>
    )
  }

  /**
   * Plan trip from/to here buttons, plus the schedule date control.
   */
  _renderControls = () => {
    const { calendarMax, calendarMin, homeTimezone, intl, stopData } =
      this.props
    const { date } = this.state
    const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()

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
      <div role="group" style={{ marginBottom: '10px' }}>
        {stopData ? <StyledFromToPicker place={stopData} /> : null}
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
            {/* scrollable list of scheduled stops requires tabIndex 
            for keyboard navigation */}
            <Scrollable tabIndex={0}>
              {/* If geometries are available (and are not a point) and stop times 
                are not, it is a strong indication that the stop is a flex stop.

                The extra checks stopData are needed to ensure that the message is 
                not shown while stopData is loading
                */}
              {stopIsFlex(stopData) && (
                <div style={{ lineHeight: 'normal' }}>
                  <FormattedMessage id="components.StopViewer.flexStop" />
                </div>
              )}
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
  zoomToPlace: mapActions.zoomToPlace
}

export default injectIntl(
  withMap(connect(mapStateToProps, mapDispatchToProps)(StopScheduleViewer))
)
