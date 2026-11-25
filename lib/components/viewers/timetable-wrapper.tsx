import { Calendar } from 'react-calendar'
import { connect, useSelector } from 'react-redux'
import { endOfDay, format } from 'date-fns'
import { ExternalLinkAlt } from '@styled-icons/fa-solid'
import { FormattedMessage, useIntl } from 'react-intl'
import { matchPath } from 'react-router'
import { Route } from '@opentripplanner/types'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { Value } from 'react-calendar/dist/shared/types'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import styled from 'styled-components'
import TimeTable from '@opentripplanner/timetable'

import * as apiActions from '../../actions/api'
import { AppReduxState } from '../../util/state-types'
import { blue } from '../util/colors'
import { ComponentContext } from '../../util/contexts'
import { getSortedFilteredRoutes } from '../../util/state'
import { TIMETABLE_PATH } from '../../util/constants'
import { TimetableDataParams } from '../util/types'
import AppModule from '../app/app-module'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import Loading from '../narrative/loading'
import RouteSelect, { RouteSelectOption } from '../../util/RouteSelect'

import { RouteRowDetails } from './route-row'

import 'react-calendar/dist/Calendar.css'

interface TimeTableWrapperProps {
  closedStops?: Set<string>
  findRoutesIfNeeded: () => void
  getStopClosures: (date: Date) => void
  getTimetableData: (params: TimetableDataParams) => void
  homeTimezone: string
  routeId: string
  routes: Route[]
  stopClosuresError?: string
}

// Layout Constants

const TIMETABLE_HEADER_HEIGHT = 4
const ROUTE_INFORMATION_HEIGHT = 4
const TIMETABLE_WIDTH = '80%'

const StyledCalendar = styled(Calendar)`
  border: 0 !important;

  button.react-calendar__navigation__arrow {
    min-width: 30px !important;
  }

  .react-calendar__tile--now {
    background-color: ${blue[50]};
    color: ${blue[800]};
  }

  .react-calendar__tile--active {
    background-color: ${blue[900]};
    color: white;
  }

  .react-calendar__tile--now:enabled:hover {
    background-color: ${blue[100]};
  }

  .react-calendar__tile--active:hover,
  .react-calendar__tile--active:focus {
    background-color: ${blue[700]} !important;
  }
`

const TodayButton = styled.button`
  background-color: transparent;
  border: 0;
  color: ${blue[900]};
  font-weight: 700;
  width: fit-content;
  margin-bottom: 2em;
  text-align: left;
  padding: 0;

  &:hover {
    color: ${blue[700]};
  }
`

const TimetableWindow = styled.div`
  height: calc(100vh - 20px);
  margin: 0 2rem;
`

const TimetableHeader = styled.h1`
  height: ${TIMETABLE_HEADER_HEIGHT}rem;
  border-bottom: #333 solid 1px;
  margin-bottom: 0;
`

const TimetableControlPanel = styled.div`
  width: calc(100% - ${TIMETABLE_WIDTH});
  min-width: 225px;
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 1em;
`

const TimetableBody = styled.div`
  height: calc(100% - ${TIMETABLE_HEADER_HEIGHT}rem - 20px);
  margin: 0;
  display: flex;
  padding-top: 1em;
  gap: 1em;
  justify-content: space-between;
`

const SwitchDirectionButton = styled.button`
  background: ${blue[800]};
  border: none;
  color: white;
  padding: 5px;
  transition: 100ms ease-in all;
  width: 100%;

  &:hover {
    background-color: ${blue[900]};
    transition: 100ms ease-in all;
  }
`

const RouteInformationContainer = styled.span`
  align-items: center;
  display: flex;
  gap: 7px;
  height: ${ROUTE_INFORMATION_HEIGHT}rem;

  .route-block {
    max-width: none;
  }
`

const TimetableContainer = styled.div`
  display: flex;
  height: calc(100% - ${ROUTE_INFORMATION_HEIGHT}rem);
`

// eslint-disable-next-line complexity
const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const {
    closedStops,
    findRoutesIfNeeded,
    getStopClosures,
    getTimetableData,
    homeTimezone,
    routeId,
    routes,
    stopClosuresError
  } = props

  const timetable = useSelector(
    (state: AppReduxState) => state.otp.ui.timetable
  )

  const handleRouteUrlClick = useCallback(
    (e) => {
      e.preventDefault()
      window.open(timetable?.route?.url, undefined, 'width=1000,height=800')
    },
    [timetable]
  )

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [currentRoute, setCurrentRoute] = useState(routeId)
  // Initialize to the current date in the config's timezone
  const [date, setDate] = useState<Date>(new Date())

  const intl = useIntl()

  // @ts-expect-error context is not typed
  const { ModeIcon, RouteRenderer } = useContext(ComponentContext)

  useEffect(() => {
    setLoading(true)
    // TODO: Determine best way to handle stop closures that start/end somewhere in the
    // middle of a service day. For now, we will be conservative and ask for stop closures
    // that are valid at 23:59 of the given day; this will capture closures that took effect
    // (started) during the service day, but will not include closures that ended sometime
    // during the service day.

    // Midnight local time at beginning of service day:
    const stopClosuresDate = zonedTimeToUtc(date, homeTimezone)
    // Shift to end of day to capture stop closures that begin on this date:
    getStopClosures(endOfDay(stopClosuresDate))

    getTimetableData({
      date: format(utcToZonedTime(date, homeTimezone), 'yyyy-MM-dd'),
      routeGtfsId: currentRoute
    })
  }, [
    date,
    getTimetableData,
    routeId,
    getStopClosures,
    homeTimezone,
    currentRoute
  ])

  const routeInformation = useMemo(() => timetable?.route, [timetable])

  useEffect(findRoutesIfNeeded, [findRoutesIfNeeded])

  useEffect(() => {
    // TODO: improve handling of data fetching to avoid issues with useEffect and stale data.
    // This will be important when the capability to fetch timetables for different dates via a calendar
    // is added.
    if (routeInformation) setLoading(false)
  }, [routeInformation])

  const directionIdsAreInvalid = useMemo(() => {
    const invalid = routeInformation?.patterns?.some(
      (pattern: any) => ![0, 1].includes(pattern?.directionId)
    )

    if (invalid)
      console.warn(
        'Direction IDs of timetable data are not valid (must be 0 or 1 for every pattern)'
      )

    return invalid
  }, [routeInformation])

  const handleDateChange = (value: Value) => {
    // @ts-expect-error Value can technically be an array but it will only ever be a date here
    value && setDate(new Date(value))
  }

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route)
    // Match URL to route selected
    window.location.href = `${window.location.origin}/#/timetable/${route}`
  }

  if (stopClosuresError)
    console.warn('Error loading stop closures', stopClosuresError)

  if (!closedStops) console.warn('No stop closures object is defined')

  const routeAlreadySelected = (option: RouteSelectOption): boolean => {
    return option.value === currentRoute
  }

  const TimeTableData = () =>
    routeId && routeInformation && !directionIdsAreInvalid ? (
      <>
        <RouteInformationContainer>
          <RouteRowDetails
            intl={intl}
            ModeIcon={ModeIcon}
            route={routeInformation}
            RouteRenderer={RouteRenderer}
          />
          {/* This does not look awesome on smaller screen sizes */}
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            {routeInformation.desc}
          </span>
          {routeInformation.url && (
            <a
              aria-label={intl.formatMessage({
                id: 'components.Timetable.routeInformation'
              })}
              href={routeInformation.url}
              onClick={handleRouteUrlClick}
              title={intl.formatMessage({
                id: 'components.Timetable.routeInformation'
              })}
            >
              <ExternalLinkAlt size={15} />
            </a>
          )}
        </RouteInformationContainer>
        <TimetableContainer>
          <TimeTable
            additionalColumns={[
              'NOTICES',
              'BLOCK_ID',
              'TRIP_SHORT_NAME',
              'TRIP_HEADSIGN',
              'TRIP_ID'
            ]}
            closedStops={closedStops}
            directionId={directionId}
            includeDwellStops
            route={routeInformation}
            timepointsOnly={timepointsOnly}
          />
        </TimetableContainer>
      </>
    ) : (
      <FormattedMessage id="components.Timetable.errorLoadingTimetable" />
    )

  return (
    <AppModule load={['call']}>
      <TimetableWindow>
        <TimetableHeader>
          <FormattedMessage id="components.Timetable.timetableHeader" />
        </TimetableHeader>
        <TimetableBody>
          <TimetableControlPanel>
            <RouteSelect
              disabled={routeAlreadySelected}
              id="timetable-route-select"
              onChange={(e: RouteSelectOption) =>
                // eslint-disable-next-line prettier/prettier
              handleRouteChange(e.value)}
              routes={routes}
            />
            <InvisibleA11yLabel>
              <FormattedMessage id="components.Timetable.timetableDate" />
            </InvisibleA11yLabel>
            <StyledCalendar
              formatMonthYear={
                (locale, date) =>
                  new Intl.DateTimeFormat(locale, {
                    month: 'short'
                  }).format(date)
                // eslint-disable-next-line react/jsx-curly-newline
              }
              formatShortWeekday={
                (locale, date) =>
                  new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
                    date
                  )
                // eslint-disable-next-line react/jsx-curly-newline
              }
              onChange={handleDateChange}
              value={date}
            />
            <TodayButton onClick={() => setDate(new Date())}>
              Jump to today
            </TodayButton>
            <label htmlFor="timepoints-checkbox">
              <input
                checked={timepointsOnly}
                id="timepoints-checkbox"
                onChange={() => setTimepointsOnly(!timepointsOnly)}
                style={{ marginRight: '10px' }}
                type="checkbox"
              />
              <FormattedMessage id="components.Timetable.showTimepointsOnly" />
            </label>
            <SwitchDirectionButton
              onClick={() => setDirectionId(directionId === 1 ? 0 : 1)}
            >
              <FormattedMessage id="components.Timetable.switchDirection" />
            </SwitchDirectionButton>
          </TimetableControlPanel>

          {(stopClosuresError || !closedStops) && (
            <FormattedMessage id="components.Timetable.errorLoadingStopClosures" />
          )}
          <div style={{ width: TIMETABLE_WIDTH }}>
            {loading ? <Loading /> : <TimeTableData />}
          </div>
        </TimetableBody>
      </TimetableWindow>
    </AppModule>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { pathname } = state.router.location
  const match = matchPath<{ routeId: string }>(pathname, {
    exact: true,
    path: TIMETABLE_PATH(':routeId'),
    strict: false
  })
  const routeId = match?.params.routeId ?? ''
  const routes = getSortedFilteredRoutes(state)

  return {
    closedStops: state.otp.ui.stopClosures.closedStops,
    homeTimezone: state.otp.config.homeTimezone,
    routeId,
    routes,
    stopClosuresError: state.otp.ui.stopClosures.error
  }
}

const mapDispatchToProps = {
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  getStopClosures: apiActions.getStopClosures,
  getTimetableData: apiActions.getTimetableData
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)
