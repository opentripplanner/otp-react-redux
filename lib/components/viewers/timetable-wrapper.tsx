import { connect, useSelector } from 'react-redux'
import { ExternalLinkAlt } from '@styled-icons/fa-solid'
import { format } from 'date-fns'
import { FormattedMessage, useIntl } from 'react-intl'
import { matchPath } from 'react-router'
import { Route } from '@opentripplanner/types'
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
import Loading from '../narrative/loading'
import RouteSelect, { RouteSelectOption } from '../../util/RouteSelect'

import { RouteRowDetails } from './route-row'

interface TimeTableWrapperProps {
  closedStops?: Set<string>
  findRoutesIfNeeded: () => void
  getStopClosures: () => void
  getTimetableData: (params: TimetableDataParams) => void
  routeId: string
  routes: Route[]
  stopClosuresError?: string
}

const TIMETABLE_HEADER_HEIGHT = 4

const TimetableWindow = styled.div`
  height: calc(100vh - 20px);
  margin: 0 3rem;
`

const TimetableHeader = styled.h1`
  height: ${TIMETABLE_HEADER_HEIGHT}rem;
  border-bottom: #333 solid 1px;
  margin-bottom: 0;
`

const TimetableControlPanel = styled.div`
  width: 20%;
  min-width: 225px;
  display: flex;
  flex-direction: column;
  gap: 1em;
`

const TimetableBody = styled.div`
  height: calc(100% - ${TIMETABLE_HEADER_HEIGHT}rem - 20px);
  margin: 0;
  display: flex;
  padding-top: 2em;
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

const ROUTE_INFORMATION_HEIGHT = 4

const RouteInformationContainer = styled.span`
  align-items: center;
  display: flex;
  gap: 7px;
  height: ${ROUTE_INFORMATION_HEIGHT}rem;
`

const TimetableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - ${ROUTE_INFORMATION_HEIGHT}rem);
`

// eslint-disable-next-line complexity
const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const {
    closedStops,
    findRoutesIfNeeded,
    getStopClosures,
    getTimetableData,
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
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [currentRoute, setCurrentRoute] = useState(routeId)

  const intl = useIntl()

  // @ts-expect-error context is not typed
  const { ModeIcon, RouteRenderer } = useContext(ComponentContext)

  useEffect(() => {
    setLoading(true)
    getStopClosures()

    getTimetableData({
      // The Date constructor has a quirk: passing in yyyy-MM-dd will create the date in UTC, causing
      // issues with timezone offsets. Passing in yyyy/MM/dd will honor the local machine's timezone
      date: new Date(date.replaceAll('-', '/')),
      routeGtfsId: currentRoute
    })
  }, [date, getTimetableData, getStopClosures, currentRoute])

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length) setDate(e.target.value)
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
          <span>
            <label htmlFor="date-picker" style={{ marginRight: '10px' }}>
              <FormattedMessage id="components.Timetable.timetableDate" />
            </label>
            <input
              id="date-picker"
              onChange={handleDateChange}
              type="date"
              value={date}
            />
          </span>
          <SwitchDirectionButton
            onClick={() => setDirectionId(directionId === 1 ? 0 : 1)}
          >
            <FormattedMessage id="components.Timetable.switchDirection" />
          </SwitchDirectionButton>
        </TimetableControlPanel>

        {(stopClosuresError || !closedStops) && (
          <FormattedMessage id="components.Timetable.errorLoadingStopClosures" />
        )}
        <div style={{ width: '75%' }}>
          {loading ? <Loading /> : <TimeTableData />}
        </div>
      </TimetableBody>
    </TimetableWindow>
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
