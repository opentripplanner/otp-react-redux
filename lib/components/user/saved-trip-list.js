import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import React, { Component } from 'react'
import { Button, Glyphicon, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import AccountPage from './account-page'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import AwaitingScreen from './awaiting-screen'
import BackToTripPlanner from './back-to-trip-planner'
import { PageHeading } from './styled'
import TripSummaryPane from './trip-summary-pane'
import { TRIPS_PATH } from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import withLoggedInUserSupport from './with-logged-in-user-support'

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
          <PageHeading>You have no saved trips</PageHeading>
          <p>Perform a trip search from the map first.</p>
        </>
      )
    } else {
      // Stack the saved trip summaries and commands.
      content = (
        <>
          <BackToTripPlanner />
          <PageHeading>My trips</PageHeading>
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

const TripHeader = styled.h3`
  margin-top: 0px;
`

const PanelHeading = styled(Panel.Heading)`
  background-color: white!important;
`

const PanelFooter = styled(Panel.Footer)`
  background-color: white!important;
  padding: 0px;
  button {
    border: 0px;
    padding: 13px 0px;
    width: 33.333%;
  }

  button:first-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button:nth-child(2) {
    border-radius: 0;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }

  button:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0;
  }
`

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
  _handlePauseOrResumeMonitoring = () => {
    const { createOrUpdateUserMonitoredTrip, trip } = this.props
    const newTrip = clone(trip)
    newTrip.isActive = !newTrip.isActive

    // Silent update of existing trip.
    createOrUpdateUserMonitoredTrip(newTrip, false, true)
  }

  /**
   * Deletes a trip from persistence.
   * (The operation also refetches the redux monitoredTrips for the logged-in user.)
   */
  _handleDeleteTrip = async () => {
    if (confirm('Would you like to remove this trip?')) {
      const { deleteUserMonitoredTrip, trip } = this.props
      await deleteUserMonitoredTrip(trip.id)
    }
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
        <PanelHeading>
          <Panel.Title>
            <TripHeader>{trip.tripName}</TripHeader>
            <small>From <b>{from.name}</b> to <b>{to.name}</b></small>
          </Panel.Title>
        </PanelHeading>
        <Panel.Body>
          <TripSummaryPane monitoredTrip={trip} />
        </Panel.Body>
        <PanelFooter>
          <Button onClick={this._handlePauseOrResumeMonitoring}>
            {trip.isActive
              ? <><Glyphicon glyph='pause' /> Pause</>
              : <><Glyphicon glyph='play' /> Resume</>
            }
          </Button>
          <Button onClick={this._handleEditTrip}>
            <Glyphicon glyph='pencil' /> Edit
          </Button>
          <Button onClick={this._handleDeleteTrip}>
            <Glyphicon glyph='trash' /> Delete
          </Button>
        </PanelFooter>
      </Panel>
    )
  }
}

// connect to the redux store
const itemMapStateToProps = () => ({})

const itemMapDispatchToProps = {
  createOrUpdateUserMonitoredTrip: userActions.createOrUpdateUserMonitoredTrip,
  deleteUserMonitoredTrip: userActions.deleteUserMonitoredTrip,
  routeTo: uiActions.routeTo
}

const ConnectedTripListItem = connect(itemMapStateToProps, itemMapDispatchToProps)(TripListItem)
