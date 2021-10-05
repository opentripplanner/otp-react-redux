import { Auth0Provider } from '@auth0/auth0-react'
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory } from 'history'
import isEqual from 'lodash.isequal'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import qs from 'qs'
import React, { Component } from 'react'
import { Col, Grid, Row } from 'react-bootstrap'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'

import * as authActions from '../../actions/auth'
import * as callTakerActions from '../../actions/call-taker'
import * as configActions from '../../actions/config'
import * as formActions from '../../actions/form'
import * as locationActions from '../../actions/location'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import PrintFieldTripLayout from '../admin/print-field-trip-layout'
import { frame } from '../app/app-frame'
import { RedirectWithQuery } from '../form/connected-links'
import Map from '../map/map'
import MobileMain from '../mobile/main'
import { getAuth0Config } from '../../util/auth'
import {
  ACCOUNT_PATH,
  AUTH0_AUDIENCE,
  AUTH0_SCOPE,
  ACCOUNT_SETTINGS_PATH,
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_PLACES_PATH,
  CREATE_ACCOUNT_VERIFY_PATH,
  PLACES_PATH,
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH,
  TRIPS_PATH,
  URL_ROOT
} from '../../util/constants'
import { ComponentContext } from '../../util/contexts'
import { getDefaultLocale } from '../../util/i18n'
import { getActiveItinerary, getTitle } from '../../util/state'
import AfterSignInScreen from '../user/after-signin-screen'
import BeforeSignInScreen from '../user/before-signin-screen'
import FavoritePlaceScreen from '../user/places/favorite-place-screen'
import SavedTripList from '../user/monitored-trip/saved-trip-list'
import SavedTripScreen from '../user/monitored-trip/saved-trip-screen'
import UserAccountScreen from '../user/user-account-screen'
import withLoggedInUserSupport from '../user/with-logged-in-user-support'

import PrintLayout from './print-layout'
import DesktopNav from './desktop-nav'

const { isMobile } = coreUtils.ui

class ResponsiveWebapp extends Component {
  static propTypes = {
    initZoomOnLocate: PropTypes.number,
    query: PropTypes.object
  }

  static contextType = ComponentContext

  /** Lifecycle methods **/

  /* eslint-disable-next-line complexity */
  componentDidUpdate (prevProps) {
    const {
      activeSearchId,
      currentPosition,
      formChanged,
      initZoomOnLocate,
      location,
      matchContentToUrl,
      query,
      setLocale,
      setLocationToCurrent,
      setMapCenter,
      setMapZoom,
      title
    } = this.props
    document.title = title
    const urlParams = coreUtils.query.getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    // Determine if trip is being replanned by checking the active search ID
    // against the ID found in the URL params. If they are different, a new one
    // has been routed to (see handleBackButtonPress) and there is no need to
    // trigger a form change because necessarily the query will be different
    // from the previous query.
    const replanningTrip = newSearchId && activeSearchId && newSearchId !== activeSearchId
    if (!isEqual(prevProps.query, query) && !replanningTrip) {
      // Trigger on form change action if previous query is different from
      // current one AND trip is not being replanned already. This will
      // determine whether a search needs to be made, the mobile view needs
      // updating, etc.
      formChanged(prevProps.query, query)
    }

    // check if device position changed (typically only set once, on initial page load)
    if (currentPosition !== prevProps.currentPosition) {
      if (currentPosition.error || !currentPosition.coords) return
      const pt = {
        lat: currentPosition.coords.latitude,
        lon: currentPosition.coords.longitude
      }

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (isMobile() && query.from === null) {
        setLocationToCurrent({ locationType: 'from' })
        setMapCenter(pt)
        if (initZoomOnLocate) {
          setMapZoom({ zoom: initZoomOnLocate })
        }
      }
    }
    // If the path changes (e.g., via a back button press) check whether the
    // main content needs to switch between, for example, a viewer and a search.
    if (!isEqual(location.pathname, prevProps.location.pathname)) {
      // console.log('url changed to', location.pathname)
      matchContentToUrl(location)
    }
    // If the URL locale parameter changes or is initially blank, (e.g., user modifies anything after ?, e.g. locale)
    // update the corresponding redux state.
    if ((!urlParams.locale && !prevProps.locale) || (urlParams.locale && urlParams.locale !== prevProps.locale)) {
      setLocale(urlParams.locale)
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
    const {
      getCurrentPosition,
      handleBackButtonPress,
      initializeModules,
      location,
      matchContentToUrl,
      parseUrlQueryString,
      receivedPositionResponse,
      title
    } = this.props
    // Add on back button press behavior.
    window.addEventListener('popstate', handleBackButtonPress)
    document.title = title

    // If a URL is detected without hash routing (e.g., http://localhost:9966?sessionId=test),
    // window.location.search will have a value. In this case, we need to redirect to the URL root with the
    // search reconstructed for use with the hash router.
    // Exception: Do not redirect after auth0 login, which sets the URL in the form
    // http://localhost:9966/?code=xxxxxxx&state=yyyyyyyyy that we want to preserve.
    const search = window.location.search
    if (search) {
      const searchParams = qs.parse(search, { ignoreQueryPrefix: true })
      if (!(searchParams.code && searchParams.state)) {
        window.location.href = `${URL_ROOT}/#/${search}`
        return
      }
    }

    if (isMobile()) {
      // If on mobile browser, check position on load
      getCurrentPosition()

      // Also, watch for changes in position on mobile
      navigator.geolocation.watchPosition(
        // On success
        position => { receivedPositionResponse({ position }) },
        // On error
        error => { console.log('error in watchPosition', error) },
        // Options
        { enableHighAccuracy: true }
      )
    }
    // Handle routing to a specific part of the app (e.g. stop viewer) on page
    // load. (This happens prior to routing request in case special routerId is
    // set from URL.)
    matchContentToUrl(location)
    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      parseUrlQueryString()
    }
    // Initialize call taker/field trip modules (check for valid auth session).
    initializeModules()
  }

  componentWillUnmount () {
    // Remove on back button press listener.
    window.removeEventListener('popstate', this.props.handleBackButtonPress)
  }

  renderDesktopView = () => {
    const { MainControls, MainPanel, MapWindows } = this.context
    return (
      <div className='otp'>
        <DesktopNav />
        <Grid>
          <Row className='main-row'>
            <Col className='sidebar' md={4} sm={6}>
              {/*
                Note: the main tag provides a way for users of screen readers
                to skip to the primary page content.
                TODO: Find a better place.
              */}
              <main>
                {<MainPanel />}
              </main>
            </Col>
            {MainControls && <MainControls />}
            <Col className='map-container' md={8} sm={6}>
              {MapWindows && <MapWindows />}
              <Map />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

  renderMobileView = () => {
    return (
      // <main> Needed for accessibility checks. TODO: Find a better place.
      <main>
        <MobileMain />
      </main>
    )
  }

  render () {
    return isMobile() ? this.renderMobileView() : this.renderDesktopView()
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const title = getTitle(state)
  return {
    activeItinerary: getActiveItinerary(state),
    activeSearchId: state.otp.activeSearchId,
    currentPosition: state.otp.location.currentPosition,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    locale: state.otp.ui.locale,
    mobileScreen: state.otp.ui.mobileScreen,
    modeGroups: state.otp.config.modeGroups,
    query: state.otp.currentQuery,
    searches: state.otp.searches,
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
  setLocale: uiActions.setLocale,
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

// TODO: A number of these routes are ignored during a11y testing as no server mocks are available
export const routes = [
  {
    exact: true,
    path: [
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
    ],
    shouldRenderWebApp: true
  },
  {
    a11yIgnore: true,
    component: FavoritePlaceScreen,
    path: [`${CREATE_ACCOUNT_PLACES_PATH}/:id`, `${PLACES_PATH}/:id`]
  },
  {
    a11yIgnore: true,
    component: SavedTripScreen,
    path: `${TRIPS_PATH}/:id`
  },
  {
    a11yIgnore: true,
    children: <RedirectWithQuery to={TRIPS_PATH} />,
    exact: true,
    path: ACCOUNT_PATH
  },
  {
    a11yIgnore: true,
    children: <RedirectWithQuery to={CREATE_ACCOUNT_VERIFY_PATH} />,
    exact: true,
    path: CREATE_ACCOUNT_PATH
  },
  {
    a11yIgnore: true,
    // This route lets new or existing users edit or set up their account.
    component: UserAccountScreen,
    path: [`${CREATE_ACCOUNT_PATH}/:step`, ACCOUNT_SETTINGS_PATH]
  },
  {
    getContextComponent: (components) => frame(components.TermsOfService),
    path: TERMS_OF_SERVICE_PATH
  },
  {
    getContextComponent: (components) => frame(components.TermsOfStorage),
    path: TERMS_OF_STORAGE_PATH
  },
  {
    a11yIgnore: true,
    component: SavedTripList,
    path: TRIPS_PATH
  },
  {
    a11yIgnore: true,
    // This route is called immediately after login by Auth0
    // and by the onRedirectCallback function from /lib/util/auth.js.
    // For new users, it displays the account setup form.
    // For existing users, it takes the browser back to the itinerary search prior to login.
    component: AfterSignInScreen,
    path: '/signedin'
  },
  {
    a11yIgnore: true,
    component: PrintLayout,
    path: '/print'
  },
  {
    a11yIgnore: true,
    component: PrintFieldTripLayout,
    path: '/printFieldTrip'
  }
]

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
      defaultLocale,
      locale,
      localizedMessages,
      processSignIn,
      routerConfig,
      showAccessTokenError,
      showLoginError
    } = this.props

    const router = localizedMessages && (
      <ComponentContext.Provider value={components}>
        <IntlProvider
          defaultLocale={defaultLocale}
          locale={locale || defaultLocale}
          messages={localizedMessages}
        >
          <ConnectedRouter
            basename={routerConfig && routerConfig.basename}
            history={history}>
            <Switch>
              {routes.map((props, index) => {
                const {
                  getContextComponent,
                  shouldRenderWebApp,
                  ...routerProps
                } = props

                return (
                  <Route
                    component={getContextComponent
                      ? getContextComponent(components)
                      : undefined
                    }
                    render={shouldRenderWebApp
                      ? () => <WebappWithRouter {...this.props} />
                      : undefined
                    }
                    {...routerProps} />
                )
              })}
              {/* For any other route, simply return the web app. */}
              <Route
                render={() => <WebappWithRouter {...this.props} />}
              />
            </Switch>
          </ConnectedRouter>
        </IntlProvider>
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

const mapStateToWrapperProps = (state, ownProps) => {
  const { persistence, reactRouter } = state.otp.config
  return {
    auth0Config: getAuth0Config(persistence),
    defaultLocale: getDefaultLocale(state.otp.config),
    locale: state.otp.ui.locale,
    localizedMessages: state.otp.ui.localizedMessages,
    routerConfig: reactRouter
  }
}

const mapWrapperDispatchToProps = {
  processSignIn: authActions.processSignIn,
  showAccessTokenError: authActions.showAccessTokenError,
  showLoginError: authActions.showLoginError
}

export default connect(mapStateToWrapperProps, mapWrapperDispatchToProps)(RouterWrapperWithAuth0)
