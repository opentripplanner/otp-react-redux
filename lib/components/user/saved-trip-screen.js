import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as yup from 'yup'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import DesktopNav from '../app/desktop-nav'
import SavedTripEditor from './saved-trip-editor'
import TripBasicsPane from './trip-basics-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripSummaryPane from './trip-summary-pane'
import { ALL_DAYS, arrayToDayFields, WEEKDAYS } from '../../util/monitored-trip'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import withLoggedInUserSupport from './with-logged-in-user-support'

// The validation schema shape for the form fields.
// TODO: add fields here as they are implemented.
const validationSchemaShape = {
  isActive: yup.boolean(),
  leadTimeInMinutes: yup.number().positive().integer(),
  tripName: yup.string()
    .required('Please enter a trip name')
}
// Add the checks on each day that at least one day is monitored.
ALL_DAYS.forEach(day => {
  validationSchemaShape[day] = yup.boolean().test(
    'one-day-selected',
    'Please select at least one day to monitor',
    function () {
      let selectedDays = 0
      ALL_DAYS.forEach(day => {
        if (this.parent[day]) selectedDays++
      })
      return selectedDays !== 0
    }
  )
})

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
  /**
   * Persists changes to edited trip.
   */
  _updateMonitoredTrip = async monitoredTrip => {
    const { isCreating, createOrUpdateUserMonitoredTrip } = this.props
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
   * Saves a trip and returns to the saved trips screen.
   * @param {*} monitoredTrip The trip edited state to be saved, provided by Formik.
   */
  _handleSaveTrip = async monitoredTrip => {
    await this._updateMonitoredTrip(monitoredTrip)
    this._goToSavedTrips()
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  _panes = {
    basics: TripBasicsPane,
    notifications: TripNotificationsPane,
    summary: TripSummaryPane
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
  _getTripToEdit = props => {
    if (props.isCreating) {
      const { itinerary, loggedInUser, queryParams } = props
      return createMonitoredTrip(loggedInUser, queryParams, itinerary)
    } else {
      const { match, monitoredTrips } = props
      const { path, url } = match
      if (monitoredTrips && path === '/savedtrips/:id') {
        // Trip id is the portion of url after the second (the last) slash.
        const tripId = url.split('/')[2]
        return monitoredTrips.find(trip => trip.id === tripId)
      }
    }

    return null
  }

  render () {
    const { isCreating, loggedInUser, monitoredTrips } = this.props
    const monitoredTrip = this._getTripToEdit(this.props)
    const otherTripNames = monitoredTrips
      .filter(trip => trip !== monitoredTrip)
      .map(trip => trip.tripName)

    const clonedSchemaShape = clone(validationSchemaShape)
    clonedSchemaShape.tripName = yup.string()
      .required('Please enter a trip name')
      .notOneOf(otherTripNames, 'You already using this name for another saved trip. Please enter a different name.')
    const validationSchema = yup.object(clonedSchemaShape)

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <Formik
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          validationSchema={validationSchema}
          onSubmit={this._handleSaveTrip}
          initialValues={clone(monitoredTrip)}
        >
          {
            // Formik props provide access to the current user data state and errors
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            props => {
              return (
                <Form className='container' noValidate>
                  <SavedTripEditor
                    {...props}
                    isCreating={isCreating}
                    notificationChannel={loggedInUser.notificationChannel}
                    onCancel={isCreating ? this._goToTripPlanner : this._goToSavedTrips}
                    panes={this._panes}
                  />
                </Form>
              )
            }
          }
        </Formik>
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
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(SavedTripScreen),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
