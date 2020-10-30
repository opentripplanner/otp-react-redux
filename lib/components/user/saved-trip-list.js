import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import React, { Component } from 'react'
import { Button, ButtonGroup, Glyphicon, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import DesktopNav from '../app/desktop-nav'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import AwaitingScreen from './awaiting-screen'
import LinkButton from './link-button'
import TripSummaryPane from './trip-summary-pane'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This component displays the list of saved trips for the logged-in user.
 */
const SavedTripList = ({ trips }) => {
  // TODO: Improve navigation.
  const accountLink = <p><LinkButton to='/account'>Back to My Account</LinkButton></p>
  let content

  if (!trips) {
    // Flash an indication while user trips are being loaded.
    content = <AwaitingScreen />
  } else if (trips.length === 0) {
    content = (
      <>
        {accountLink}
        <h1>You have no saved trips</h1>
        <p>Perform a trip search from the map first.</p>
      </>
    )
  } else {
    // Stack the saved trip summaries and commands.
    content = (
      <>
        {accountLink}
        <h1>My saved trips</h1>
        {trips.map((trip, index) => <ConnectedTripListItem key={index} trip={trip} />)}
      </>
    )
  }

  return (
    <div className='otp'>
      {/* TODO: Do mobile view. */}
      <DesktopNav />
      <div className='container'>
        {content}
      </div>
    </div>
  )
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

/**
 * This class manages events and rendering for one item in the saved trip list.
 */
class TripListItem extends Component {
  /**
   * Navigate to the saved trip's URL #/savedtrips/trip-id-123.
   * (There shouldn't be a need to encode the ids from Mongo.)
   */
  _handleEditTrip = () => {
    const { routeTo, trip } = this.props
    routeTo(`/savedtrips/${trip.id}`)
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
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass='h3'>{trip.tripName}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <TripSummaryPane monitoredTrip={trip} />
          <ButtonGroup>
            <Button bsSize='small' onClick={this._handlePauseOrResumeMonitoring}>
              {trip.isActive
                ? <><Glyphicon glyph='pause' /> Pause</>
                : <><Glyphicon glyph='play' /> Resume</>
              }
            </Button>
            <Button bsSize='small' onClick={this._handleEditTrip}>
              <Glyphicon glyph='pencil' /> Edit
            </Button>
            <Button bsSize='small' onClick={this._handleDeleteTrip}>
              <Glyphicon glyph='trash' /> Delete
            </Button>
          </ButtonGroup>
        </Panel.Body>
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
