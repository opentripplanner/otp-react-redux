import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape, useIntl } from 'react-intl'
import { Panel } from 'react-bootstrap'
import { TriangleExclamation } from '@styled-icons/fa-solid/TriangleExclamation'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as userActions from '../../../actions/user'
import { AppReduxState } from '../../../util/state-types'
import { Edit } from '@styled-icons/fa-solid'
import { IconWithText } from '../../util/styledIcon'
import { MonitoredTrip } from '../types'
import {
  PageHeading,
  TripHeader,
  TripPanelAlert,
  TripPanelFooter,
  TripPanelHeading,
  TripPanelTitle
} from '../styled'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { TRIPS_PATH } from '../../../util/constants'
import AccountPage from '../account-page'
import AwaitingScreen from '../awaiting-screen'
import BackToTripPlanner from '../back-to-trip-planner'
import PageTitle from '../../util/page-title'

import styled from 'styled-components'

import withLoggedInUserSupport from '../with-logged-in-user-support'

import getRenderData from './trip-status-rendering-strategies'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import { ComponentContext } from '../../../util/contexts'
import Link from '../../util/link'
import MetroItineraryRoutes from '../../narrative/metro/metro-itinerary-routes'

import TripSummaryPane from './trip-summary-pane'

interface ItemOwnProps {
  trip: MonitoredTrip
}

interface ItemProps extends ItemOwnProps {
  intl: IntlShape
  renderData: any
  togglePauseTrip: (trip: MonitoredTrip, intl: IntlShape) => void
}

interface ItemState {
  pendingRequest: 'pause' | 'delete' | false
}

interface Props {
  trips?: MonitoredTrip[]
}

const TripContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
// Prevent the invisible header in route-blocks from causing white space
const RouteBlockGrid = styled.div`
  display: grid;
  grid-template-columns: 2;

  span {
    grid-row: 1;
  }
`

/**
 * This class manages events and rendering for one item in the saved trip list.
 */
class TripListItem extends Component<ItemProps, ItemState> {
  constructor(props: ItemProps) {
    super(props)
    this.state = {
      pendingRequest: false
    }
  }

  static contextType = ComponentContext

  componentDidUpdate = (prevProps: ItemProps) => {
    if (prevProps.trip.isActive !== this.props.trip.isActive) {
      this.setState({ pendingRequest: false })
    }
  }

  /**
   * Pauses or resumes the specified trip.
   */
  _handleTogglePauseMonitoring = () => {
    const { intl, togglePauseTrip, trip } = this.props
    this.setState({ pendingRequest: 'pause' })
    togglePauseTrip(trip, intl)
  }

  render() {
    const { intl, renderData, trip } = this.props
    const { itinerary } = trip
    const { legs } = itinerary
    const { alerts, shouldRenderAlerts } = renderData
    // Assuming the monitored itinerary has at least one leg:
    // - get the 'from' location of the first leg,
    // - get the 'to' location of the last leg.
    const from = legs[0].from
    const to = legs[legs.length - 1].to
    const editTripPath = `${TRIPS_PATH}/${trip.id}`
    const { LegIcon } = this.context
    return (
      <Panel>
        <TripPanelHeading>
          <TripPanelTitle>
            <Panel.Title>
              <TripHeader>{trip.tripName}</TripHeader>
            </Panel.Title>
            <Link
              title={intl.formatMessage({
                id: 'components.SavedTripEditor.editSavedTrip'
              })}
              to={editTripPath}
            >
              <Edit height={18} />
              <InvisibleA11yLabel>
                <FormattedMessage id="components.SavedTripEditor.editSavedTrip" />
              </InvisibleA11yLabel>
            </Link>
          </TripPanelTitle>
          <RouteBlockGrid>
            {/* TODO: Fix issues with custom route renderer */}
            <MetroItineraryRoutes
              expanded={false}
              itinerary={itinerary}
              LegIcon={LegIcon}
            />
          </RouteBlockGrid>
        </TripPanelHeading>
        <Panel.Body>
          <TripSummaryPane
            from={from}
            handleTogglePauseMonitoring={this._handleTogglePauseMonitoring}
            monitoredTrip={trip}
            pendingRequest={this.state.pendingRequest}
            to={to}
          />
          <TripPanelFooter>
            {shouldRenderAlerts && (
              <Link to={editTripPath}>
                <TripPanelAlert>
                  <IconWithText Icon={TriangleExclamation}>
                    <FormattedMessage
                      id="components.SavedTripList.alertTag"
                      values={{ alert: alerts.length }}
                    />
                  </IconWithText>
                </TripPanelAlert>
              </Link>
            )}
          </TripPanelFooter>
        </Panel.Body>
      </Panel>
    )
  }
}

// connect to the redux store
const itemMapStateToProps = (state: AppReduxState, { trip }: ItemOwnProps) => {
  return {
    renderData: getRenderData({
      monitoredTrip: trip
    })
  }
}

const itemMapDispatchToProps = {
  togglePauseTrip: userActions.togglePauseTrip
}
const ConnectedTripListItem = connect(
  itemMapStateToProps,
  itemMapDispatchToProps
)(injectIntl(TripListItem))

/**
 * This component displays the list of saved trips for the logged-in user.
 */
const SavedTripList = ({ trips }: Props) => {
  const intl = useIntl()
  let content

  if (!trips) {
    // Flash an indication while user trips are being loaded.
    content = <AwaitingScreen />
  } else {
    // Repeat text from the SubNav component in the title bar for brevity.
    const shortTitle = intl.formatMessage({
      id: 'components.SubNav.trips'
    })
    const myAccount = intl.formatMessage({
      id: 'components.SubNav.myAccount'
    })
    const pageTitle = [shortTitle, myAccount]

    if (trips.length === 0) {
      content = (
        <>
          <BackToTripPlanner />
          <PageTitle title={pageTitle} />
          <PageHeading>
            <FormattedMessage id="components.SavedTripList.noSavedTrips" />
          </PageHeading>
          <p>
            <FormattedMessage id="components.SavedTripList.noSavedTripsInstructions" />
          </p>
        </>
      )
    } else {
      // Stack the saved trip summaries and commands.
      content = (
        <>
          <BackToTripPlanner />
          <PageTitle title={pageTitle} />
          <PageHeading>
            <FormattedMessage id="components.SavedTripList.myTrips" />
          </PageHeading>
          <TripContainer>
            {trips.map((trip) => (
              <ConnectedTripListItem key={trip.id} trip={trip} />
            ))}
          </TripContainer>
        </>
      )
    }
  }

  return <AccountPage>{content}</AccountPage>
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  return {
    trips: state.user.loggedInUserMonitoredTrips
  }
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps)(SavedTripList),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
