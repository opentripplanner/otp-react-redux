import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
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
  _handleTripSelect = trip => () => {
    const { id } = trip
    this.props.routeTo(`/savedtrips/${id}`)
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
          <ButtonGroup vertical block>
            {trips.map((trip, index) => (
              <Button key={index} onClick={this._handleTripSelect(trip)} style={{textAlign: 'left'}}>
                <TripSummaryPane monitoredTrip={trip} />
              </Button>
            ))}
          </ButtonGroup>
        </>
      )
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <form className='container'>
          {content}
        </form>
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
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(SavedTripList),
    {
      // Redirect back to this page if a user logs in from the "my trips" URL.
      returnTo: () => window.location.hash.substr(1)
    }
  ),
  true
)
