import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import { addTrip, deleteTrip, getTrips, updateTrip } from '../../util/middleware'
import { routeTo } from '../../actions/ui'
import DesktopNav from '../app/desktop-nav'
import { arrayToDayFields, WEEKDAYS } from '../../util/monitored-trip'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import AwaitingScreen from './awaiting-screen'
import SavedTripEditor from './saved-trip-editor'
import SavedTripWizard from './saved-trip-wizard'
import TripBasicsPane from './trip-basics-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripSummaryPane from './trip-summary-pane'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * Initializes a monitored trip object from the given query.
 */
function getNewMonitoredTrip (loggedInUser, queryParams, itinerary) {
  return {
    ...arrayToDayFields(WEEKDAYS),
    excludeFederalHolidays: true,
    isActive: true,
    itinerary,
    leadTimeInMinutes: 30,
    queryParams,
    tripName: '',
    userId: loggedInUser.id // must provide to API.
  }
}

function hasMaxTripCount (trips) {
  return trips && trips.length >= 5
}

/**
 * This screen handles saving a trip from an OTP query for the logged-in user.
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

    const { itinerary, loggedInUser, queryParams, wizard } = props
    const thisMonitoredTrip = wizard ? getNewMonitoredTrip(loggedInUser, queryParams, itinerary) : null

    this.state = {
      monitoredTrip: thisMonitoredTrip,
      trips: null
    }
  }

  _fetchTrips = async () => {
    const { accessToken, persistence, routeTo, wizard } = this.props
    const fetchResult = await getTrips(persistence.otp_middleware, accessToken)

    if (fetchResult.status === 'success') {
      const trips = fetchResult.data
      this.setState({ trips })

      // There is a middleware limit of 5 saved trips,
      // so if that limit is already reached, alert, then show editing mode.
      const maxTripCount = hasMaxTripCount(trips)
      if (wizard && maxTripCount) {
        alert('You already have reached the maximum of five saved trips.\n' +
            'Please remove unused trips from your saved trips, and try again.')

        routeTo('/savedtrips')
        return
      }

      if (!wizard && trips.length) {
        this._handleMonitoredTripSelect(trips[0])
      }
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

  _updateMonitoredTrip = async () => {
    const { accessToken, persistence, wizard } = this.props

    if (persistence && persistence.otp_middleware) {
      const { monitoredTrip } = this.state

      // TODO: Change state of Save button.

      let result
      if (wizard) {
        result = await addTrip(persistence.otp_middleware, accessToken, monitoredTrip)
      } else {
        result = await updateTrip(persistence.otp_middleware, accessToken, monitoredTrip)
      }

      // TODO: improve this.
      if (result.status === 'success') {
        alert('Your preferences have been saved.')
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    }
  }

  _handleDeleteTrip = async () => {
    if (confirm('Would you like to remove this trip?')) {
      const { accessToken, persistence } = this.props
      const { monitoredTrip, trips } = this.state
      const deleteResult = await deleteTrip(persistence.otp_middleware, accessToken, monitoredTrip)

      if (deleteResult.status === 'success') {
        const removedIndex = trips.indexOf(monitoredTrip)
        const newTrips = [].concat(trips)
        newTrips.splice(removedIndex, 1)
        const newIndex = Math.min(removedIndex, newTrips.length - 1)
        this.setState({
          monitoredTrip: newTrips[newIndex],
          trips: newTrips
        })
      }
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

  _handleMonitoredTripSelect = trip => {
    this.setState({
      monitoredTrip: trip
    })
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

  async componentDidMount () {
    await this._fetchTrips()

    // TODO: Update title bar during componentDidMount.
  }

  render () {
    const { wizard } = this.props
    const { monitoredTrip, trips } = this.state

    if (!trips) {
      return <AwaitingScreen />
    }

    const maxTripCount = hasMaxTripCount(trips)

    let content

    if (wizard && !maxTripCount) {
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
          onCancel={this._handleExit}
          onComplete={this._handleExitAndSave}
          onDeleteTrip={this._handleDeleteTrip}
          onMonitoredTripSelect={this._handleMonitoredTripSelect}
          panes={this._panes}
          trips={trips}
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
    persistence: state.otp.config.persistence,
    queryParams: state.router.location.search
  }
}

const mapDispatchToProps = {
  routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(SavedTripScreen)),
  true
)
