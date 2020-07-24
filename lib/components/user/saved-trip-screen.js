import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import DesktopNav from '../app/desktop-nav'
import { arrayToDayFields, WEEKDAYS } from '../../util/monitored-trip'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import SavedTripEditor from './saved-trip-editor'
import SavedTripWizard from './saved-trip-wizard'
import TripBasicsPane from './trip-basics-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripSummaryPane from './trip-summary-pane'
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
 * This screen handles saving a trip from an OTP query, or editing saved trips
 * for the currently logged-in user.
 */
class SavedTripScreen extends Component {
  static propTypes = {
    originalUrl: PropTypes.string
  }

  static defaultProps = {
    originalUrl: '/'
  }

  constructor (props) {
    super(props)

    const { isCreating, itinerary, loggedInUser, queryParams } = props
    const thisMonitoredTrip = isCreating ? createMonitoredTrip(loggedInUser, queryParams, itinerary) : null

    this.state = {
      monitoredTrip: thisMonitoredTrip
    }
  }

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
   * Selects no trip.
   */
  _selectNoTrip = () => {
    this.setState({
      monitoredTrip: null,
      tripIndex: -1
    })
  }

  _updateMonitoredTrip = async () => {
    const { isCreating, createOrUpdateUserMonitoredTrip } = this.props
    const { monitoredTrip } = this.state
    await createOrUpdateUserMonitoredTrip(monitoredTrip, isCreating)
  }

  _handleDeleteTrip = async () => {
    if (confirm('Would you like to remove this trip?')) {
      const { deleteUserMonitoredTrip } = this.props
      const { monitoredTrip } = this.state
      await deleteUserMonitoredTrip(monitoredTrip.id)

      this._selectNoTrip()
    }
  }

  _handleExit = () => {
    const { originalUrl } = this.props
    this.props.routeTo(originalUrl)
  }

  _handleExitAndSave = async () => {
    await this._updateMonitoredTrip()
    this._handleExit()
  }

  _handleMonitoredTripSelect = tripIndex => {
    this.setState({
      monitoredTrip: this.props.monitoredTrips[tripIndex],
      tripIndex
    })
  }

  _handleSaveTripEdits = async () => {
    await this._updateMonitoredTrip()
    this._selectNoTrip()
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
    const { isCreating, monitoredTrips, routeTo } = this.props

    // There is a middleware limit of 5 saved trips,
    // so if that limit is already reached, alert, then show editing mode.
    if (isCreating && hasMaxTripCount(monitoredTrips)) {
      alert('You already have reached the maximum of five saved trips.\n' +
          'Please remove unused trips from your saved trips, and try again.')

      routeTo('/savedtrips')
    }

    // TODO: Update title bar during componentDidMount.
  }

  render () {
    const { isCreating, monitoredTrips } = this.props
    const { monitoredTrip } = this.state

    let content
    if (isCreating && !hasMaxTripCount(monitoredTrips)) {
      content = (
        <SavedTripWizard
          monitoredTrip={monitoredTrip}
          onComplete={this._handleExitAndSave}
          panes={this._panes}
        />
      )
    } else {
      content = (
        <SavedTripEditor
          monitoredTrip={monitoredTrip}
          onComplete={this._handleSaveTripEdits}
          onDeleteTrip={this._handleDeleteTrip}
          onMonitoredTripSelect={this._handleMonitoredTripSelect}
          panes={this._panes}
          trips={monitoredTrips}
        />
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
  const activeSearch = getActiveSearch(state.otp)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const itineraries = getActiveItineraries(state.otp) || []
  return {
    accessToken: state.user.accessToken,
    itinerary: itineraries[activeItinerary],
    loggedInUser: state.user.loggedInUser,
    monitoredTrips: state.user.loggedInUserMonitoredTrips,
    persistence: state.otp.config.persistence,
    queryParams: state.router.location.search
  }
}

const mapDispatchToProps = {
  createOrUpdateUserMonitoredTrip: userActions.createOrUpdateUserMonitoredTrip,
  deleteUserMonitoredTrip: userActions.deleteUserMonitoredTrip,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(SavedTripScreen)),
  true
)
