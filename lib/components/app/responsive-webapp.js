import { Auth0Provider } from '@auth0/auth0-react'
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory } from 'history'
import isEqual from 'lodash.isequal'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'

import PrintLayout from './print-layout'
import * as authActions from '../../actions/auth'
import * as callTakerActions from '../../actions/call-taker'
import * as configActions from '../../actions/config'
import * as formActions from '../../actions/form'
import * as locationActions from '../../actions/location'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { RedirectWithQuery } from '../form/connected-links'
import { getAuth0Config } from '../../util/auth'
import {
  ACCOUNT_PATH,
  AUTH0_AUDIENCE,
  AUTH0_SCOPE,
  ACCOUNT_SETTINGS_PATH,
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_TERMS_PATH,
  PLACES_PATH,
  TRIPS_PATH,
  URL_ROOT
} from '../../util/constants'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary, getTitle } from '../../util/state'
import AfterSignInScreen from '../user/after-signin-screen'
import BeforeSignInScreen from '../user/before-signin-screen'
import FavoritePlaceScreen from '../user/places/favorite-place-screen'
import SavedTripList from '../user/monitored-trip/saved-trip-list'
import SavedTripScreen from '../user/monitored-trip/saved-trip-screen'
import UserAccountScreen from '../user/user-account-screen'
import withLoggedInUserSupport from '../user/with-logged-in-user-support'

const { isMobile } = coreUtils.ui

class ResponsiveWebapp extends Component {
  static propTypes = {
    desktopView: PropTypes.element,
    initZoomOnLocate: PropTypes.number,
    mobileView: PropTypes.element,
    query: PropTypes.object
  }

  /** Lifecycle methods **/

  componentDidUpdate (prevProps) {
    const { currentPosition, location, query, title } = this.props
    document.title = title
    const urlParams = coreUtils.query.getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    // Determine if trip is being replanned by checking the active search ID
    // against the ID found in the URL params. If they are different, a new one
    // has been routed to (see handleBackButtonPress) and there is no need to
    // trigger a form change because necessarily the query will be different
    // from the previous query.
    const replanningTrip = newSearchId && this.props.activeSearchId && newSearchId !== this.props.activeSearchId
    if (!isEqual(prevProps.query, query) && !replanningTrip) {
      // Trigger on form change action if previous query is different from
      // current one AND trip is not being replanned already. This will
      // determine whether a search needs to be made, the mobile view needs
      // updating, etc.
      this.props.formChanged(prevProps.query, query)
    }

    // check if device position changed (typically only set once, on initial page load)
    if (currentPosition !== prevProps.currentPosition) {
      if (currentPosition.error || !currentPosition.coords) return
      const pt = {
        lat: currentPosition.coords.latitude,
        lon: currentPosition.coords.longitude
      }

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (isMobile() && this.props.query.from === null) {
        this.props.setLocationToCurrent({ locationType: 'from' })
        this.props.setMapCenter(pt)
        if (this.props.initZoomOnLocate) {
          this.props.setMapZoom({ zoom: this.props.initZoomOnLocate })
        }
      }
    }
    // If the path changes (e.g., via a back button press) check whether the
    // main content needs to switch between, for example, a viewer and a search.
    if (!isEqual(location.pathname, prevProps.location.pathname)) {
      // console.log('url changed to', location.pathname)
      this.props.matchContentToUrl(location)
    }
    // Check for change between ITINERARY and PROFILE routingTypes
    // TODO: restore this for profile mode
    /* if (query.routingType !== nextProps.query.routingType) {
      let queryModes = nextProps.query.mode.split(',')
      // If we are entering 'ITINERARY' mode, ensure that one and only one access mode is selected
      if (nextProps.query.routingType === 'ITINERARY') {
        queryModes = ensureSingleAccessMode(queryModes)
        this.props.setQueryParam({ mode: queryModes.join(',') })
      }
      // If we are entering 'PROFILE' mode, ensure that CAR_HAIL is not selected
      // TODO: make this more generic, i.e. introduce concept of mode->routingType permissions
      if (nextProps.query.routingType === 'ITINERARY') {
        queryModes = queryModes.filter(mode => mode !== 'CAR_HAIL')
        this.props.setQueryParam({ mode: queryModes.join(',') })
      }
    } */
  }

  componentDidMount () {
    // Add on back button press behavior.
    window.addEventListener('popstate', this.props.handleBackButtonPress)
    const { location, title } = this.props
    document.title = title
    if (isMobile()) {
      // If on mobile browser, check position on load
      this.props.getCurrentPosition()

      // Also, watch for changes in position on mobile
      navigator.geolocation.watchPosition(
        // On success
        position => { this.props.receivedPositionResponse({ position }) },
        // On error
        error => { console.log('error in watchPosition', error) },
        // Options
        { enableHighAccuracy: true }
      )
    }
    // Handle routing to a specific part of the app (e.g. stop viewer) on page
    // load. (This happens prior to routing request in case special routerId is
    // set from URL.)
    this.props.matchContentToUrl(this.props.location)
    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      this.props.parseUrlQueryString()
    }
    // Initialize call taker/field trip modules (check for valid auth session).
    this.props.initializeModules()
  }

  componentWillUnmount () {
    // Remove on back button press listener.
    window.removeEventListener('popstate', this.props.handleBackButtonPress)
  }

  render () {
    const { desktopView, mobileView } = this.props
    return isMobile() ? mobileView : desktopView
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const title = getTitle(state)
  return {
    activeItinerary: getActiveItinerary(state.otp),
    activeSearchId: state.otp.activeSearchId,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    searches: state.otp.searches,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    modeGroups: state.otp.config.modeGroups,
    title
  }
}

const mapDispatchToProps = {
  formChanged: formActions.formChanged,
  getCurrentPosition: locationActions.getCurrentPosition,
  handleBackButtonPress: uiActions.handleBackButtonPress,
  initializeModules: callTakerActions.initializeModules,
  matchContentToUrl: uiActions.matchContentToUrl,
  parseUrlQueryString: formActions.parseUrlQueryString,
  receivedPositionResponse: locationActions.receivedPositionResponse,
  setLocationToCurrent: mapActions.setLocationToCurrent,
  setMapCenter: configActions.setMapCenter,
  setMapZoom: configActions.setMapZoom
}

const history = createHashHistory()

const WebappWithRouter = withRouter(
  withLoggedInUserSupport(
    connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp)
  )
)

/**
 * The routing component for the application.
 * This is the top-most "standard" component,
 * and we initialize the Auth0Provider here
 * so that Auth0 services are available everywhere.
 */
class RouterWrapperWithAuth0 extends Component {
  render () {
    const {
      auth0Config,
      components,
      processSignIn,
      routerConfig,
      showAccessTokenError,
      showLoginError
    } = this.props

    const router = (
      <ComponentContext.Provider value={components}>
        <ConnectedRouter
          basename={routerConfig && routerConfig.basename}
          history={history}>
          <Switch>
            <Route
              exact
              path={[
                // App root
                '/',
                // Load app with preset lat/lon/zoom and optional router
                // NOTE: All params will be cast to :id in matchContentToUrl due
                // to a quirk with react-router.
                // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
                '/@/:latLonZoomRouter',
                '/start/:latLonZoomRouter',
                // Route viewer (and route ID).
                '/route',
                '/route/:id',
                // Stop viewer (and stop ID).
                '/stop',
                '/stop/:id'
              ]}
              render={() => <WebappWithRouter {...this.props} />}
            />
            <Route
              component={FavoritePlaceScreen}
              path={`${PLACES_PATH}/:id`}
            />
            <Route
              component={SavedTripScreen}
              path={`${TRIPS_PATH}/:id`}
            />
            <Route exact path={ACCOUNT_PATH}>
              <RedirectWithQuery to={TRIPS_PATH} />
            </Route>
            <Route exact path={CREATE_ACCOUNT_PATH}>
              <RedirectWithQuery to={CREATE_ACCOUNT_TERMS_PATH} />
            </Route>
            <Route
              // This route lets new or existing users edit or set up their account.
              component={UserAccountScreen}
              path={[`${CREATE_ACCOUNT_PATH}/:step`, ACCOUNT_SETTINGS_PATH]}
            />
            <Route
              component={SavedTripList}
              path={TRIPS_PATH}
            />
            <Route
              // This route is called immediately after login by Auth0
              // and by the onRedirectCallback function from /lib/util/auth.js.
              // For new users, it displays the account setup form.
              // For existing users, it takes the browser back to the itinerary search prior to login.
              component={AfterSignInScreen}
              path='/signedin'
            />
            <Route
              component={PrintLayout}
              path='/print'
            />
            {/* For any other route, simply return the web app. */}
            <Route
              render={() => <WebappWithRouter {...this.props} />}
            />
          </Switch>
        </ConnectedRouter>
      </ComponentContext.Provider>
    )

    return (
      auth0Config
        ? (
          <Auth0Provider
            audience={AUTH0_AUDIENCE}
            clientId={auth0Config.clientId}
            domain={auth0Config.domain}
            onAccessTokenError={showAccessTokenError}
            onLoginError={showLoginError}
            onRedirectCallback={processSignIn}
            onRedirecting={BeforeSignInScreen}
            redirectUri={URL_ROOT}
            scope={AUTH0_SCOPE}
          >
            {router}
          </Auth0Provider>
        )
        : router
    )
  }
}

const mapStateToWrapperProps = (state, ownProps) => ({
  auth0Config: getAuth0Config(state.otp.config.persistence),
  routerConfig: state.otp.config.reactRouter
})

const mapWrapperDispatchToProps = {
  processSignIn: authActions.processSignIn,
  showAccessTokenError: authActions.showAccessTokenError,
  showLoginError: authActions.showLoginError
}

export default connect(mapStateToWrapperProps, mapWrapperDispatchToProps)(RouterWrapperWithAuth0)
