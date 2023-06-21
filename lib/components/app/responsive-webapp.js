// TODO: Remove this eslint exception when implementing TypeScript.
/* eslint-disable react/prop-types */
import { Auth0Provider } from '@auth0/auth0-react'
import { Col, Grid, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory } from 'history'
import { injectIntl, IntlProvider } from 'react-intl'
import { MapProvider } from 'react-map-gl'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import { Route, Switch, withRouter } from 'react-router'
import coreUtils from '@opentripplanner/core-utils'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import qs from 'qs'
import React, { Component } from 'react'

import * as authActions from '../../actions/auth'
import * as callTakerActions from '../../actions/call-taker'
import * as formActions from '../../actions/form'
import * as locationActions from '../../actions/location'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from '../../util/constants'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary } from '../../util/state'
import { getAuth0Config } from '../../util/auth'
import { getDefaultLocale } from '../../util/i18n'
import BeforeSignInScreen from '../user/before-signin-screen'
import Map from '../map/map'
import MobileMain from '../mobile/main'
import printRoutes from '../../util/webapp-print-routes'
import webAppRoutes from '../../util/webapp-routes'
import withLoggedInUserSupport from '../user/with-logged-in-user-support'
import withMap from '../map/with-map'

import DesktopNav from './desktop-nav'
import PopupWrapper from './popup'
import SessionTimeout from './session-timeout'
import ViewSwitcher from './view-switcher'

const { isMobile } = coreUtils.ui

const routes = [...webAppRoutes, ...printRoutes]

class ResponsiveWebapp extends Component {
  static propTypes = {
    initZoomOnLocate: PropTypes.number,
    query: PropTypes.object
  }

  static contextType = ComponentContext

  /** Lifecycle methods **/

  /* eslint-disable-next-line complexity */
  componentDidUpdate(prevProps) {
    const {
      activeSearchId,
      currentPosition,
      formChanged,
      initZoomOnLocate,
      intl,
      location,
      map,
      matchContentToUrl,
      query,
      setLocationToCurrent,
      setMapCenter
    } = this.props
    const urlParams = coreUtils.query.getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    // Determine if trip is being replanned by checking the active search ID
    // against the ID found in the URL params. If they are different, a new one
    // has been routed to (see handleBackButtonPress) and there is no need to
    // trigger a form change because necessarily the query will be different
    // from the previous query.
    const replanningTrip =
      newSearchId && activeSearchId && newSearchId !== activeSearchId
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
        setLocationToCurrent({ locationType: 'from' }, intl)
        setMapCenter(map, pt, initZoomOnLocate)
      }
    }
    // If the path changes (e.g., via a back button press) check whether the
    // main content needs to switch between, for example, a viewer and a search.
    if (!isEqual(location.pathname, prevProps.location.pathname)) {
      // console.log('url changed to', location.pathname)
      matchContentToUrl(map, location)
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

  componentDidMount() {
    const {
      getCurrentPosition,
      handleBackButtonPress,
      initializeModules,
      intl,
      location,
      map,
      matchContentToUrl,
      parseUrlQueryString,
      receivedPositionResponse
    } = this.props
    // Add on back button press behavior.
    window.addEventListener('popstate', handleBackButtonPress)

    // If a URL is detected without hash routing (e.g., http://localhost:9966?sessionId=test),
    // window.location.search will have a value. In this case, we need to redirect to the URL root with the
    // search reconstructed for use with the hash router.
    // Exception: Do not redirect after auth0 login, which sets the URL in the form
    // http://localhost:9966/?code=xxxxxxx&state=yyyyyyyyy that we want to preserve.
    const search = window.location.search
    if (search) {
      const searchParams = qs.parse(search, { ignoreQueryPrefix: true })
      if (!(searchParams.code && searchParams.state)) {
        window.location.href = `${window.location.origin}/#/${search}`
        return
      }
    }

    if (isMobile()) {
      // If on mobile browser, check position on load
      getCurrentPosition(intl)

      // Also, watch for changes in position on mobile
      navigator.geolocation.watchPosition(
        // On success
        (position) => {
          // This object cloning is required to be allowed to read the position info twice
          // on webkit browsers.
          // See https://github.com/opentripplanner/otp-react-redux/pull/697 for details
          receivedPositionResponse({ position: { ...position } })
        },
        // On error
        (error) => {
          console.log('error in watchPosition', error)
        },
        // Options
        { enableHighAccuracy: true }
      )
    }
    // Handle routing to a specific part of the app (e.g. stop viewer) on page
    // load. (This happens prior to routing request in case special routerId is
    // set from URL.)
    matchContentToUrl(map, location)
    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      parseUrlQueryString()
    }
    // Initialize call taker/field trip modules (check for valid auth session).
    initializeModules(intl)
  }

  componentWillUnmount() {
    // Remove on back button press listener.
    window.removeEventListener('popstate', this.props.handleBackButtonPress)
  }

  _hidePopup = () => {
    const { setPopupContent } = this?.props
    if (setPopupContent) setPopupContent(null)
  }

  renderDesktopView = () => {
    const { sessionTimeoutSeconds } = this.props
    const { MainControls, MainPanel, MapWindows } = this.context
    const { popupContent } = this.props
    return (
      <div className="otp">
        <DesktopNav />
        <PopupWrapper content={popupContent} hideModal={this._hidePopup} />
        {/* Note: the main tag provides a way for users of screen readers to skip to the
                  primary page content (tabindex = -1 needed for programmatic navigation skip). */}
        <div className="bubbles-wrapper">
          <main className="main-full " classNatabIndex={-1}>
            <ViewSwitcher />
            <MainPanel />
          </main>
          <div className="main-full secondary">
            {`The 7 Flushing Local and 7 Flushing Express[3] are two rapid transit services in the A Division of the New York City Subway, providing local and express services along the full length of the IRT Flushing Line. Their route emblems, or "bullets", are colored purple, since they serve the Flushing Line.[4]

7 trains operate at all times between Main Street in Flushing, Queens and 34th Street–Hudson Yards in Chelsea, Manhattan. Local service, denoted by a (7) in a circular bullet, operates at all times, while express service, denoted by a <7> in a diamond-shaped bullet, runs only during rush hours and early evenings in the peak direction and during special events.

The 7 route started running in 1915 when the Flushing Line opened. Since 1927, the 7 has held largely the same route, except for a one-stop western extension from Times Square to Hudson Yards on September 13, 2015.
Service history
For the history of the trackage, see IRT Flushing Line § History.
Early history

On June 13, 1915, the first test train on the IRT Flushing Line ran between Grand Central and Vernon Boulevard–Jackson Avenue, followed by the start of revenue service on June 22.[5] The Flushing Line was extended one stop from Vernon–Jackson Avenue to Hunters Point Avenue on February 15, 1916.[6][7] On November 5, 1916, the Flushing Line was extended two more stops east to the Queensboro Plaza station.[8][9][7] The line was opened from Queensboro Plaza to Alburtis Avenue (now 103rd Street–Corona Plaza) on April 21, 1917.[8][10][11][12] Service to 111th Street was inaugurated on October 13, 1925, with shuttle service running between 111th Street, and the previous terminal at Alburtis Avenue on the Manhattan-bound track.[13][14]

On March 22, 1926, Flushing Line service was extended one stop westward from Grand Central to Fifth Avenue, when that portion of the Flushing Line was opened.[15][16]: 4  The line was extended to Times Square almost exactly a year later, on March 14, 1927.[17]: 13 [18] Though an eastward extension to Willets Point Boulevard opened on May 7 of the same year,[19][17]: 13  service was provided by shuttle trains for the first week, until through service was inaugurated.[20][21] The eastern extension to Flushing–Main Street opened on January 21, 1928.[22]

The service on the Flushing Line east of Queensboro Plaza was shared by the Interborough Rapid Transit Company (IRT) and the Brooklyn–Manhattan Transit Corporation (BMT) from 1912 to 1949; BMT trains were designated 9, while IRT services were designated 7 on maps only.[23] The I`}
          </div>
          <div className="main-full secondary">another one test</div>
        </div>
        {MainControls && <MainControls />}
        <div className="map-container-full">
          {MapWindows && <MapWindows />}
          <Map />
        </div>
        {sessionTimeoutSeconds && <SessionTimeout />}
      </div>
    )
  }

  renderMobileView = () => {
    const { popupContent } = this.props

    return (
      <>
        <PopupWrapper content={popupContent} hideModal={this._hidePopup} />
        <MobileMain />
      </>
    )
  }

  render() {
    return isMobile() ? this.renderMobileView() : this.renderDesktopView()
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  return {
    activeItinerary: getActiveItinerary(state),
    activeSearchId: state.otp.activeSearchId,
    currentPosition: state.otp.location.currentPosition,
    initZoomOnLocate:
      state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    locale: state.otp.ui.locale,
    mobileScreen: state.otp.ui.mobileScreen,
    modeGroups: state.otp.config.modeGroups,
    popupContent: state.otp.ui.popup,
    query: state.otp.currentQuery,
    searches: state.otp.searches,
    sessionTimeoutSeconds: state.otp.config.sessionTimeoutSeconds
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
  setMapCenter: mapActions.setMapCenter,
  setPopupContent: uiActions.setPopupContent
}

const history = createHashHistory()

const WebappWithRouter = withRouter(
  withLoggedInUserSupport(
    withMap(
      injectIntl(connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp))
    )
  )
)

/**
 * The routing component for the application.
 * This is the top-most "standard" component,
 * and we initialize the Auth0Provider here
 * so that Auth0 services are available everywhere.
 */
class RouterWrapperWithAuth0 extends Component {
  constructor(props) {
    super(props)
    this._initializeOrUpdateLocale(props)
  }

  componentDidUpdate(prevProps) {
    this._initializeOrUpdateLocale(this.props, prevProps)
  }

  /**
   * On component initialization, or if the URL locale parameter
   * changes or is initially blank, (e.g., user modifies anything after ?, e.g. locale)
   * update the corresponding redux state.
   * @param {*} props The current props for the component
   * @param {*} prevProps Optional previous props, if available.
   */
  _initializeOrUpdateLocale(props, prevProps) {
    const urlParams = coreUtils.query.getUrlParams()
    const { locale: newLocale } = urlParams

    if (
      !prevProps ||
      (!newLocale && !prevProps.locale) ||
      (newLocale && newLocale !== prevProps.locale)
    ) {
      props.setLocale(newLocale)
    }
  }

  render() {
    const {
      auth0Config,
      components,
      defaultLocale,
      homeTimezone,
      locale,
      localizedMessages,
      processSignIn,
      routerConfig,
      showAccessTokenError,
      showLoginError
    } = this.props

    // Don't render anything until the locale/localized messages have been initialized.
    const router = localizedMessages && (
      <ComponentContext.Provider value={components}>
        <MapProvider>
          <IntlProvider
            defaultLocale={defaultLocale}
            locale={locale || defaultLocale}
            messages={localizedMessages}
            timeZone={homeTimezone}
          >
            <ConnectedRouter
              basename={routerConfig && routerConfig.basename}
              history={history}
            >
              <QueryParamProvider adapter={ReactRouter5Adapter}>
                <Switch>
                  {routes.map((props, index) => {
                    const {
                      getContextComponent,
                      shouldRenderWebApp,
                      ...routerProps
                    } = props

                    return (
                      <Route
                        component={
                          getContextComponent
                            ? getContextComponent(components)
                            : undefined
                        }
                        key={index}
                        render={
                          shouldRenderWebApp
                            ? () => <WebappWithRouter {...this.props} />
                            : undefined
                        }
                        {...routerProps}
                      />
                    )
                  })}
                  {/* For any other route, simply return the web app. */}
                  <Route render={() => <WebappWithRouter {...this.props} />} />
                </Switch>
              </QueryParamProvider>
            </ConnectedRouter>
          </IntlProvider>
        </MapProvider>
      </ComponentContext.Provider>
    )

    return auth0Config ? (
      <Auth0Provider
        audience={AUTH0_AUDIENCE}
        clientId={auth0Config.clientId}
        domain={auth0Config.domain}
        onAccessTokenError={showAccessTokenError}
        onLoginError={showLoginError}
        onRedirectCallback={processSignIn}
        onRedirecting={BeforeSignInScreen}
        redirectUri={window.location.origin}
        scope={AUTH0_SCOPE}
      >
        {router}
      </Auth0Provider>
    ) : (
      router
    )
  }
}

const mapStateToWrapperProps = (state) => {
  const { homeTimezone, persistence, reactRouter } = state.otp.config
  return {
    auth0Config: getAuth0Config(persistence),
    defaultLocale: getDefaultLocale(state.otp.config, state.user.loggedInUser),
    homeTimezone,
    locale: state.otp.ui.locale,
    localizedMessages: state.otp.ui.localizedMessages,
    routerConfig: reactRouter
  }
}

const mapWrapperDispatchToProps = {
  processSignIn: authActions.processSignIn,
  setLocale: uiActions.setLocale,
  showAccessTokenError: authActions.showAccessTokenError,
  showLoginError: authActions.showLoginError
}

export default connect(
  mapStateToWrapperProps,
  mapWrapperDispatchToProps
)(RouterWrapperWithAuth0)
