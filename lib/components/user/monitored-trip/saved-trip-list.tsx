import { Button, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape, useIntl } from 'react-intl'
import { Pause } from '@styled-icons/fa-solid/Pause'
import { PencilAlt } from '@styled-icons/fa-solid/PencilAlt'
import { Play } from '@styled-icons/fa-solid/Play'
import { TriangleExclamation } from '@styled-icons/fa-solid/TriangleExclamation'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import { AppReduxState } from '../../../util/state-types'
import { IconWithText } from '../../util/styledIcon'
import { InlineLoading } from '../../narrative/loading'
import { MonitoredTrip } from '../types'
import {
  PageHeading,
  TripHeader,
  TripPanelAlert,
  TripPanelFooter,
  TripPanelHeading
} from '../styled'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { TRIPS_PATH } from '../../../util/constants'
import AccountPage from '../account-page'
import AwaitingScreen from '../awaiting-screen'
import BackToTripPlanner from '../back-to-trip-planner'
import PageTitle from '../../util/page-title'
import withLoggedInUserSupport from '../with-logged-in-user-support'

import getRenderData from './trip-status-rendering-strategies'
import TripSummaryPane from './trip-summary-pane'

interface ItemProps {
  intl: IntlShape
  renderData: any
  routeTo: (url: any) => void
  togglePauseTrip: (trip: MonitoredTrip, intl: IntlShape) => void
  trip: MonitoredTrip
}

interface ItemState {
  pendingRequest: 'pause' | 'delete' | false
}

interface Props {
  trips?: MonitoredTrip[]
}

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

  componentDidUpdate = (prevProps: ItemProps) => {
    if (prevProps.trip.isActive !== this.props.trip.isActive) {
      this.setState({ pendingRequest: false })
    }
  }

  /**
   * Navigate to the saved trip's URL #/TRIPS_PATH/trip-id-123.
   * (There shouldn't be a need to encode the ids from Mongo.)
   */
  _handleEditTrip = () => {
    const { routeTo, trip } = this.props
    routeTo(`${TRIPS_PATH}/${trip.id}`)
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
    const { renderData, trip } = this.props
    const { itinerary } = trip
    const { legs } = itinerary
    const { alerts } = renderData
    // Assuming the monitored itinerary has at least one leg:
    // - get the 'from' location of the first leg,
    // - get the 'to' location of the last leg.
    const from = legs[0].from
    const to = legs[legs.length - 1].to
    return (
      <Panel>
        <TripPanelHeading>
          {alerts && alerts.length > 0 && (
            <TripPanelAlert onClick={this._handleEditTrip}>
              <IconWithText Icon={TriangleExclamation}>
                <FormattedMessage
                  id="components.SavedTripList.alertTag"
                  values={{ alert: alerts.length }}
                />
              </IconWithText>
            </TripPanelAlert>
          )}
          <Panel.Title>
            <TripHeader>{trip.tripName}</TripHeader>
            <small>
              <FormattedMessage
                id="components.SavedTripList.fromTo"
                values={{
                  from: <strong>{from.name}</strong>,
                  to: <strong>{to.name}</strong>
                }}
              />
            </small>
          </Panel.Title>
        </TripPanelHeading>
        <Panel.Body>
          <TripSummaryPane monitoredTrip={trip} />
        </Panel.Body>
        <TripPanelFooter>
          <Button
            disabled={this.state.pendingRequest === 'pause'}
            onClick={this._handleTogglePauseMonitoring}
          >
            {this.state.pendingRequest === 'pause' ? (
              /* Make loader fit */
              <InlineLoading />
            ) : trip.isActive ? (
              <>
                <IconWithText Icon={Pause}>
                  <FormattedMessage id="components.SavedTripList.pause" />
                </IconWithText>
              </>
            ) : (
              <>
                <IconWithText Icon={Play}>
                  <FormattedMessage id="components.SavedTripList.resume" />
                </IconWithText>
              </>
            )}
          </Button>
          <Button onClick={this._handleEditTrip}>
            <IconWithText Icon={PencilAlt}>
              <FormattedMessage id="common.forms.edit" />
            </IconWithText>
          </Button>
        </TripPanelFooter>
      </Panel>
    )
  }
}

// connect to the redux store
const itemMapStateToProps = (state: AppReduxState, ownProps: ItemProps) => {
  const { trip } = ownProps
  const renderData = getRenderData({
    monitoredTrip: trip
  })

  return {
    renderData
  }
}

const itemMapDispatchToProps = {
  routeTo: uiActions.routeTo,
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
          {trips.map((trip) => (
            <ConnectedTripListItem key={trip.id} trip={trip} />
          ))}
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
