import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'
import { Button, Glyphicon, Panel } from 'react-bootstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import AccountPage from '../account-page'
import { PageHeading, TripHeader, TripPanelFooter, TripPanelHeading } from '../styled'
import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import BackToTripPlanner from '../back-to-trip-planner'
import AwaitingScreen from '../awaiting-screen'
import { TRIPS_PATH } from '../../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import withLoggedInUserSupport from '../with-logged-in-user-support'

import TripSummaryPane from './trip-summary-pane'

/**
 * This component displays the list of saved trips for the logged-in user.
 */
class SavedTripList extends Component {
  render () {
    const {trips} = this.props
    let content

    if (!trips) {
      // Flash an indication while user trips are being loaded.
      content = <AwaitingScreen />
    } else if (trips.length === 0) {
      content = (
        <>
          <BackToTripPlanner />
          <PageHeading>
            <FormattedMessage id='components.SavedTripList.noSavedTrips' />
          </PageHeading>
          <p>
            <FormattedMessage id='components.SavedTripList.noSavedTripsInstructions' />
          </p>
        </>
      )
    } else {
      // Stack the saved trip summaries and commands.
      content = (
        <>
          <BackToTripPlanner />
          <PageHeading>
            <FormattedMessage id='components.SavedTripList.myTrips' />
          </PageHeading>
          {trips.map((trip, index) => (
            <ConnectedTripListItem key={trip.id} trip={trip} />
          ))}
        </>
      )
    }

    return (
      <AccountPage>
        {content}
      </AccountPage>
    )
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

/**
 * This class manages events and rendering for one item in the saved trip list.
 */
class TripListItem extends Component {
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
    togglePauseTrip(trip, intl)
  }

  /**
   * Deletes a trip from persistence.
   * (The operation also refetches the redux monitoredTrips for the logged-in user.)
   */
  _handleDeleteTrip = () => {
    const { confirmAndDeleteUserMonitoredTrip, intl, trip } = this.props
    confirmAndDeleteUserMonitoredTrip(trip.id, intl)
  }

  render () {
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
            <small>From <b>{from.name}</b> to <b>{to.name}</b></small>
          </Panel.Title>
        </TripPanelHeading>
        <Panel.Body>
          <TripSummaryPane monitoredTrip={trip} />
        </Panel.Body>
        <TripPanelFooter>
          <Button onClick={this._handleTogglePauseMonitoring}>
            {trip.isActive
              ? (
                <>
                  <Glyphicon glyph='pause' />
                  {' '}
                  <FormattedMessage id='components.SavedTripList.pause' />
                </>
              )
              : (
                <>
                  <Glyphicon glyph='play' />
                  {' '}
                  <FormattedMessage id='components.SavedTripList.resume' />
                </>
              )
            }
          </Button>
          <Button onClick={this._handleEditTrip}>
            <Glyphicon glyph='pencil' />
            {' '}
            <FormattedMessage id='common.forms.edit' />
          </Button>
          <Button onClick={this._handleDeleteTrip}>
            <Glyphicon glyph='trash' />
            {' '}
            <FormattedMessage id='common.forms.delete' />
          </Button>
        </TripPanelFooter>
      </Panel>
    )
  }
}

// connect to the redux store
const itemMapStateToProps = () => ({})

const itemMapDispatchToProps = {
  confirmAndDeleteUserMonitoredTrip: userActions.confirmAndDeleteUserMonitoredTrip,
  routeTo: uiActions.routeTo,
  togglePauseTrip: userActions.togglePauseTrip
}

const ConnectedTripListItem = connect(
  itemMapStateToProps,
  itemMapDispatchToProps
)(injectIntl(TripListItem))
