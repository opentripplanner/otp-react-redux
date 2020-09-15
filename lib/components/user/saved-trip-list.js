import clone from 'clone'
import React, { Component } from 'react'
import { Button, ButtonGroup, Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import DesktopNav from '../app/desktop-nav'
import LinkButton from './link-button'
import TripSummaryPane from './trip-summary-pane'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This component displays the list of saved trips for the logged-in user.
 */
class SavedTripList extends Component {
  /**
   * Navigate to the saved trip's URL #/savedtrips/trip-id-123.
   * (There shouldn't be a need to encode the ids from Mongo.)
   */
  _handleEditTrip = trip => () => {
    const { id } = trip
    this.props.routeTo(`/savedtrips/${id}`)
  }

  /**
   * Pauses or resumes the specified trip.
   */
  _handlePauseOrResumeMonitoring = trip => async () => {
    const newTrip = clone(trip)
    newTrip.isActive = !newTrip.isActive

    // Silent update of existing trip.
    await this.props.createOrUpdateUserMonitoredTrip(newTrip, false, true)
  }

  /**
   * Deletes a trip from persistence
   * and refetches the redux monitoredTrips for the logged-in user.
   */
  _handleDeleteTrip = trip => async () => {
    if (confirm('Would you like to remove this trip?')) {
      await this.props.deleteUserMonitoredTrip(trip.id)
    }
  }

  render () {
    const { trips } = this.props

    // TODO: Improve navigation.
    const accountLink = <p><LinkButton to='/account'>Back to My Account</LinkButton></p>
    let content

    if (!trips || trips.length === 0) {
      content = (
        <>
          {accountLink}
          <h1>You have no saved trips</h1>
          <p>Perform a trip search from the map first.</p>
        </>
      )
    } else {
      // Stack the saved trip summaries. When the user clicks on one, they can edit that trip.
      content = (
        <>
          {accountLink}
          <h1>My saved trips</h1>
          <p>Click on a saved trip below to modify it.</p>

          {trips.map((trip, index) => (
            <Panel key={index}>
              <Panel.Heading>
                <Panel.Title componentClass='h3'>{trip.tripName}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <TripSummaryPane monitoredTrip={trip} />
                <ButtonGroup>
                  <Button bsSize='small' onClick={this._handlePauseOrResumeMonitoring(trip)}>
                    {trip.isActive ? 'Pause' : 'Monitor' /* TODO: Find better word for 'Monitor' */ }
                  </Button>
                  <Button bsSize='small' onClick={this._handleEditTrip(trip)}>Edit</Button>
                  <Button bsSize='small' onClick={this._handleDeleteTrip(trip)}>Delete</Button>
                </ButtonGroup>
              </Panel.Body>
            </Panel>
          ))}
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
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    trips: state.user.loggedInUserMonitoredTrips
  }
}

const mapDispatchToProps = {
  createOrUpdateUserMonitoredTrip: userActions.createOrUpdateUserMonitoredTrip,
  deleteUserMonitoredTrip: userActions.deleteUserMonitoredTrip,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(SavedTripList)),
  true
)
