/* eslint-disable react/prop-types */
import { Button, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Pause } from '@styled-icons/fa-solid/Pause'
import { PencilAlt } from '@styled-icons/fa-solid/PencilAlt'
import { Play } from '@styled-icons/fa-solid/Play'
import { Trash } from '@styled-icons/fa-solid/Trash'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import { IconWithText } from '../../util/styledIcon'
import { InlineLoading } from '../../narrative/loading'
import {
  PageHeading,
  TripHeader,
  TripPanelFooter,
  TripPanelHeading
} from '../styled'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { TRIPS_PATH } from '../../../util/constants'
import AccountPage from '../account-page'
import AwaitingScreen from '../awaiting-screen'
import BackToTripPlanner from '../back-to-trip-planner'
import withLoggedInUserSupport from '../with-logged-in-user-support'

import TripSummaryPane from './trip-summary-pane'

/**
 * This class manages events and rendering for one item in the saved trip list.
 */
class TripListItem extends Component {
  state = {
    pendingRequest: false
  }

  componentDidUpdate = (prevProps) => {
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

  /**
   * Deletes a trip from persistence.
   * (The operation also refetches the redux monitoredTrips for the logged-in user.)
   */
  _handleDeleteTrip = () => {
    const { confirmAndDeleteUserMonitoredTrip, intl, trip } = this.props
    this.setState({ pendingRequest: 'delete' })
    confirmAndDeleteUserMonitoredTrip(trip.id, intl)
  }

  render() {
    const { trip } = this.props
    const { itinerary } = trip
    const { legs } = itinerary
    // Assuming the monitored itinerary has at least one leg:
    // - get the 'from' location of the first leg,
    // - get the 'to' location of the last leg.
    const from = legs[0].from
    const to = legs[legs.length - 1].to
    return (
      <Panel>
        <TripPanelHeading>
          <Panel.Title>
            <TripHeader>{trip.tripName}</TripHeader>
            <small>
              From <b>{from.name}</b> to <b>{to.name}</b>
            </small>
          </Panel.Title>
        </TripPanelHeading>
        <Panel.Body>
          <TripSummaryPane monitoredTrip={trip} />
        </Panel.Body>
        <TripPanelFooter>
          <Button onClick={this._handleTogglePauseMonitoring}>
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
          <Button onClick={this._handleDeleteTrip}>
            {this.state.pendingRequest === 'delete' ? (
              <InlineLoading />
            ) : (
              <IconWithText Icon={Trash}>
                <FormattedMessage id="common.forms.delete" />
              </IconWithText>
            )}
          </Button>
        </TripPanelFooter>
      </Panel>
    )
  }
}

// connect to the redux store
const itemMapStateToProps = () => ({})

const itemMapDispatchToProps = {
  confirmAndDeleteUserMonitoredTrip:
    userActions.confirmAndDeleteUserMonitoredTrip,
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
class SavedTripList extends Component {
  render() {
    const { trips } = this.props
    let content

    if (!trips) {
      // Flash an indication while user trips are being loaded.
      content = <AwaitingScreen />
    } else if (trips.length === 0) {
      content = (
        <>
          <BackToTripPlanner />
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
          <PageHeading>
            <FormattedMessage id="components.SavedTripList.myTrips" />
          </PageHeading>
          {trips.map((trip, index) => (
            <ConnectedTripListItem key={trip.id} trip={trip} />
          ))}
        </>
      )
    }

    return <AccountPage>{content}</AccountPage>
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser,
    trips: state.user.loggedInUserMonitoredTrips
  }
}

const mapDispatchToProps = {}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(SavedTripList),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
