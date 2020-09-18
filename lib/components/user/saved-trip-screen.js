import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import DesktopNav from '../app/desktop-nav'
import SavedTripEditor from './saved-trip-editor'
import TripBasicsPane from './trip-basics-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripSummaryPane from './trip-summary-pane'
import { arrayToDayFields, WEEKDAYS } from '../../util/monitored-trip'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * Initializes a monitored trip object from the given query.
 */
function createMonitoredTrip (loggedInUser, queryParams, itinerary) {
  return {
    ...arrayToDayFields(WEEKDAYS),
    excludeFederalHolidays: true,
    isActive: true,
    itinerary,
    leadTimeInMinutes: 30,
    queryParams,
    tripName: '',
    // FIXME: Handle populating/checking userID from middleware too,
    // so that providing this field is no longer needed.
    userId: loggedInUser.id
  }
}

/**
 * Checks that the maximum allowed number of saved trips has not been reached.
 */
function hasMaxTripCount (trips) {
  // TODO: Obtain the maximum number from a query to middleware (it is currently hard coded there too).
  return trips && trips.length >= 5
}

/**
 * This screen handles saving a trip from an OTP query, or editing an existing saved trip
 * for the currently logged-in user.
 */
class SavedTripScreen extends Component {
  constructor (props) {
    super(props)

    const monitoredTrip = this._getTripToEdit(props)
    this.state = { monitoredTrip }
  }

  /**
   * Handles editing events on from all panes.
   */
  _updateMonitoredTripState = newMonitoredTrip => {
    const { monitoredTrip } = this.state
    this.setState({
      monitoredTrip: {
        ...monitoredTrip,
        ...newMonitoredTrip
      }
    })
  }

  /**
   * Persists changes to edited trip.
   */
  _updateMonitoredTrip = async () => {
    const { isCreating, createOrUpdateUserMonitoredTrip } = this.props
    const { monitoredTrip } = this.state
    await createOrUpdateUserMonitoredTrip(monitoredTrip, isCreating)
  }

  /**
   * Navigates to the trip planner (for new trips).
   */
  _goToTripPlanner = () => {
    this.props.routeTo('/')
  }

  /**
   * Navigates to saved trips screen.
   */
  _goToSavedTrips = () => {
    this.props.routeTo('/savedtrips')
  }

  /**
   * Deletes a trip from persistence and returns to the saved trips screen.
   */
  _handleDeleteTrip = async () => {
    if (confirm('Would you like to remove this trip?')) {
      const { deleteUserMonitoredTrip } = this.props
      const { monitoredTrip } = this.state
      await deleteUserMonitoredTrip(monitoredTrip.id)

      this._goToSavedTrips()
    }
  }

  _handleSaveNewTrip = async () => {
    await this._updateMonitoredTrip()
    this._goToTripPlanner()
  }

  _handleSaveTripEdits = async () => {
    await this._updateMonitoredTrip()
    this._goToSavedTrips()
  }

  /**
   * Hook monitoredTrip, onMonitoredTripChange on some panes upon rendering.
   * This returns a new render function for the passed component
   * that allows passing other props to it later if needed.
   */
  _hookMonitoredTrip = Pane => props => {
    const { monitoredTrip } = this.state
    return (
      <Pane
        onMonitoredTripChange={this._updateMonitoredTripState}
        monitoredTrip={monitoredTrip}
        {...props}
      />
    )
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  // Hook some panes to the monitoredTrip and onMonitoredTripChange props.
  _panes = {
    basics: this._hookMonitoredTrip(TripBasicsPane),
    notifications: this._hookMonitoredTrip(TripNotificationsPane),
    summary: this._hookMonitoredTrip(TripSummaryPane)
  }

  componentDidMount () {
    const { isCreating, monitoredTrips } = this.props

    // There is a middleware limit of 5 saved trips,
    // so if that limit is already reached, alert, then show editing mode.
    if (isCreating && hasMaxTripCount(monitoredTrips)) {
      alert('You already have reached the maximum of five saved trips.\n' +
          'Please remove unused trips from your saved trips, and try again.')

      this._goToSavedTrips()
    }

    // TODO: Update title bar during componentDidMount.
  }

  /**
   * Gets the trip to edit from the props.
   * Optionally saves the state.
   */
  _getTripToEdit = (props, saveState) => {
    let monitoredTrip

    if (props.isCreating) {
      const { itinerary, loggedInUser, queryParams } = props
      monitoredTrip = createMonitoredTrip(loggedInUser, queryParams, itinerary)
    } else {
      const { match, monitoredTrips } = props
      const { path, url } = match
      if (monitoredTrips && path === '/savedtrips/:id') {
        // Trip id is the portion of url after the second (the last) slash.
        const tripId = url.split('/')[2]
        monitoredTrip = monitoredTrips.find(trip => trip.id === tripId)
      } else {
        monitoredTrip = null
      }
    }

    if (saveState) {
      this.setState({ monitoredTrip })
    }

    return monitoredTrip
  }

  componentDidUpdate (prevProps) {
    // Update the monitored trip from the new props if the url has changed.
    if (prevProps.match.url !== this.props.match.url) {
      this._getTripToEdit(this.props, true)
    }
  }

  render () {
    const { isCreating } = this.props
    const { monitoredTrip } = this.state

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <form className='container'>
          <SavedTripEditor
            isCreating={isCreating}
            monitoredTrip={monitoredTrip}
            onCancel={isCreating ? this._goToTripPlanner : this._goToSavedTrips}
            onComplete={isCreating ? this._handleSaveNewTrip : this._handleSaveTripEdits}
            onDeleteTrip={this._handleDeleteTrip}
            panes={this._panes}
          />
        </form>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const itineraries = getActiveItineraries(state.otp) || []
  return {
    itinerary: itineraries[activeItinerary],
    loggedInUser: state.user.loggedInUser,
    monitoredTrips: state.user.loggedInUserMonitoredTrips,
    queryParams: state.router.location.search
  }
}

const mapDispatchToProps = {
  createOrUpdateUserMonitoredTrip: userActions.createOrUpdateUserMonitoredTrip,
  deleteUserMonitoredTrip: userActions.deleteUserMonitoredTrip,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(connect(mapStateToProps, mapDispatchToProps)(SavedTripScreen)),
  true
)
