import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import * as yup from 'yup'

import AccountPage from '../account-page'
import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import AwaitingScreen from '../awaiting-screen'
import { TRIPS_PATH } from '../../../util/constants'
import { getItineraryDefaultMonitoredDays } from '../../../util/itinerary'
import { ALL_DAYS, arrayToDayFields } from '../../../util/monitored-trip'
import { getActiveItineraries, getActiveSearch } from '../../../util/state'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import withLoggedInUserSupport from '../with-logged-in-user-support'

import TripSummaryPane from './trip-summary-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripBasicsPane from './trip-basics-pane'
import SavedTripEditor from './saved-trip-editor'

// The validation schema shape for the form fields.
// TODO: add fields here as they are implemented.
const validationSchemaShape = {
  isActive: yup.boolean(),
  leadTimeInMinutes: yup.number().positive().integer(),
  tripName: yup.string()
    // Text constant to display components.SavedTripScreen.tripNameRequired
    // It is used to allow format.js command line tool to keep track of
    // which IDs are in the code.
    .required('trip-name-required')
}
// Add the checks on each day that at least one day is monitored.
ALL_DAYS.forEach(day => {
  validationSchemaShape[day] = yup.boolean().test(
    'one-day-selected',
    'selectAtLeastOneDay', // not directly shown.
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
   * Initializes a monitored trip object from the props.
   */
  _createMonitoredTrip = () => {
    const { itinerary, loggedInUser, queryParams } = this.props
    const monitoredDays = getItineraryDefaultMonitoredDays(itinerary)
    return {
      ...arrayToDayFields(monitoredDays),
      arrivalVarianceMinutesThreshold: 5,
      departureVarianceMinutesThreshold: 5,
      excludeFederalHolidays: true,
      isActive: true,
      itinerary,
      leadTimeInMinutes: 30,
      // when creating a monitored trip, the query params will be changed on the
      // backend so that the modes parameter will reflect the modes seen in the
      // itinerary
      queryParams,
      tripName: '',
      // FIXME: Handle populating/checking userID from middleware too,
      // so that providing this field is no longer needed.
      userId: loggedInUser.id
    }
  }
  /**
   * Persists changes to the edited trip.
   * On success, this operation will also make the browser
   * navigate to the Saved trips page.
   * @param {*} monitoredTrip The trip edited state to be saved, provided by Formik.
   */
  _updateMonitoredTrip = monitoredTrip => {
    const { createOrUpdateUserMonitoredTrip, intl, isCreating } = this.props
    createOrUpdateUserMonitoredTrip(
      monitoredTrip,
      isCreating,
      undefined,
      undefined,
      intl
    )
  }

  /**
   * Navigates to the trip planner (for new trips).
   */
  _goToTripPlanner = () => this.props.routeTo('/')

  /**
   * Navigates to saved trips screen.
   */
  _goToSavedTrips = () => this.props.routeTo(TRIPS_PATH)

  // Make an index of pane components, so we don't render all panes at once on every render.
  _panes = {
    basics: TripBasicsPane,
    notifications: TripNotificationsPane,
    summary: TripSummaryPane
  }

  componentDidMount () {
    const { intl, isCreating, monitoredTrips } = this.props
    if (isCreating && hasMaxTripCount(monitoredTrips)) {
      // There is a middleware limit of 5 saved trips,
      // so if that limit is already reached, alert, then show editing mode.
      alert(intl.formatMessage({id: 'components.SavedTripScreen.tooManyTrips'}))
      this._goToSavedTrips()
    }

    // TODO: Update title bar during componentDidMount.
  }

  /**
   * Gets (or creates) the trip to edit from the props.
   */
  _getTripToEdit = () => {
    const { isCreating, monitoredTrips, tripId } = this.props
    return isCreating
      ? this._createMonitoredTrip()
      : monitoredTrips.find(trip => trip.id === tripId)
  }

  render () {
    const { isCreating, loggedInUser, monitoredTrips } = this.props

    let screenContents
    if (!monitoredTrips) {
      // Flash an indication while user trips are being loaded.
      screenContents = <AwaitingScreen />
    } else {
      const monitoredTrip = this._getTripToEdit()
      const otherTripNames = monitoredTrips
        .filter(trip => trip !== monitoredTrip)
        .map(trip => trip.tripName)

      const clonedSchemaShape = clone(validationSchemaShape)
      clonedSchemaShape.tripName = yup.string()
        // Text constant to display components.SavedTripScreen.tripNameRequired
        // Text constant is used to allow format.js command line tool to keep track of
        // which IDs are in the code.
        .required('trip-name-required')
        // Text constant to display components.SavedTripScreen.tripNameAlreadyUsed
        // Text constant is used to allow format.js command line tool to keep track of
        // which IDs are in the code.
        .notOneOf(otherTripNames, 'trip-name-already-used')
      const validationSchema = yup.object(clonedSchemaShape)

      screenContents = (
        <Formik
          enableReinitialize
          initialValues={monitoredTrip}
          onSubmit={this._updateMonitoredTrip}
          validateOnBlur
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validationSchema={validationSchema}
        >
          {
            // Formik props provide access to the current user data state and errors
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            props => {
              return (
                <Form noValidate>
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
      )
    }

    return (
      <AccountPage>
        {screenContents}
      </AccountPage>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const itineraries = getActiveItineraries(state) || []
  const tripId = ownProps.match.params.id
  return {
    activeSearchId: state.otp.activeSearchId,
    isCreating: tripId === 'new',
    itinerary: itineraries[activeItinerary],
    loggedInUser: state.user.loggedInUser,
    monitoredTrips: state.user.loggedInUserMonitoredTrips,
    queryParams: state.router.location.search,
    tripId
  }
}

const mapDispatchToProps = {
  createOrUpdateUserMonitoredTrip: userActions.createOrUpdateUserMonitoredTrip,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(SavedTripScreen)
    ),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
