// TODO: Remove this eslint exception when implementing TypeScript.
/* eslint-disable react/prop-types */
import { Auth0Provider } from '@auth0/auth0-react'
import { Col, Grid, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory } from 'history'
import { getFitBoundsPadding } from '@opentripplanner/base-map/lib/util'
import { injectIntl, IntlProvider } from 'react-intl'
import { MapProvider } from 'react-map-gl'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import { Route, Switch, withRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
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

const { isMobile } = coreUtils.ui

const routes = [...webAppRoutes, ...printRoutes]

class ResponsiveWebapp extends Component {
  static propTypes = {
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
        setMapCenter(map, pt)
      }
    } else if (query.from && query.to) {
      map?.fitBounds([query.from, query.to], {
        duration: 500,
        padding: getFitBoundsPadding(map, 0.2)
      })
    } else if (query.from && !query.to) {
      setMapCenter(map, query.from)
    } else if (query.to && !query.from) {
      setMapCenter(map, query.to)
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
      // Test location availability on load
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
        <Grid>
          <Row className="main-row">
            <Col className="sidebar" md={4} sm={6}>
              {/* Note: the main tag provides a way for users of screen readers to skip to the
                  primary page content (tabindex = -1 needed for programmatic navigation skip). */}
              <main tabIndex={-1}>
                <MainPanel />
              </main>
            </Col>
            {MainControls && <MainControls />}
            <Col className="map-container" md={8} sm={6}>
              {MapWindows && <MapWindows />}
              <Map />
            </Col>
          </Row>
        </Grid>
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
        <Toaster />
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
        // Prevents having to log-in again on page reload
        cacheLocation="localstorage"
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
